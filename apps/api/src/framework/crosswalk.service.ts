import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Control, ControlMapping, ControlMappingEvidenceHint } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ControlMappingOrigin,
  ControlReference,
  CrosswalkMatch,
  CrosswalkResponse,
  EvidenceReuseHint
} from './framework.types';
import { UpsertCrosswalkMappingDto } from './dto/upsert-crosswalk-mapping.dto';

const STOP_WORDS = new Set<string>([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'for',
  'from',
  'has',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with'
]);

type CrosswalkFilters = {
  targetFrameworkId?: string;
  minConfidence?: number;
};

type TokenProfile = {
  control: Control;
  tokens: string[];
  termSet: Set<string>;
  vector: Map<string, number>;
};

@Injectable()
export class CrosswalkService {
  private readonly maxSuggestionsPerControl = 3;

  constructor(private readonly prisma: PrismaService) {}

  async generateCrosswalk(frameworkId: string, filters: CrosswalkFilters): Promise<CrosswalkResponse> {
    const sourceFramework = await this.prisma.framework.findUnique({
      where: { id: frameworkId }
    });

    if (!sourceFramework) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    const [sourceControls, targetControls, persistedMappings] = await Promise.all([
      this.prisma.control.findMany({
        where: { frameworkId },
        orderBy: { id: 'asc' }
      }),
      this.prisma.control.findMany({
        where: filters.targetFrameworkId
          ? { frameworkId: filters.targetFrameworkId }
          : { frameworkId: { not: frameworkId } }
      }),
      this.prisma.controlMapping.findMany({
        where: {
          sourceControl: { frameworkId },
          ...(filters.targetFrameworkId
            ? { targetControl: { frameworkId: filters.targetFrameworkId } }
            : {})
        },
        include: {
          sourceControl: true,
          targetControl: true,
          evidenceHints: true
        }
      })
    ]);

    const matchSet = new Set<string>();
    const matches: CrosswalkMatch[] = persistedMappings.map((mapping) => {
      const key = this.buildKey(mapping.sourceControlId, mapping.targetControlId);
      matchSet.add(key);
      return this.toCrosswalkMatch(mapping);
    });

    const suggestions = this.generateSuggestions(
      sourceControls,
      targetControls,
      matchSet,
      filters.minConfidence ?? 0.35
    );

    matches.push(...suggestions);
    matches.sort((left, right) => right.confidence - left.confidence);

    return {
      frameworkId,
      generatedAt: new Date().toISOString(),
      total: matches.length,
      matches,
      filters
    };
  }

  async upsertManualMapping(frameworkId: string, payload: UpsertCrosswalkMappingDto): Promise<CrosswalkMatch> {
    const [sourceControl, targetControl] = await Promise.all([
      this.prisma.control.findUnique({ where: { id: payload.sourceControlId } }),
      this.prisma.control.findUnique({ where: { id: payload.targetControlId } })
    ]);

    if (!sourceControl || sourceControl.frameworkId !== frameworkId) {
      throw new NotFoundException(
        `Control ${payload.sourceControlId} does not belong to framework ${frameworkId}`
      );
    }

    if (!targetControl) {
      throw new NotFoundException(`Target control ${payload.targetControlId} not found`);
    }

    if (targetControl.frameworkId === frameworkId) {
      throw new BadRequestException('Manual crosswalk mappings must target a different framework');
    }

    const tags = this.normalizeTags(payload.tags);
    const evidenceWrites = payload.evidenceHints?.map((hint) => ({
      evidenceId: hint.evidenceId,
      summary: hint.summary.trim(),
      rationale: hint.rationale?.trim(),
      score: hint.score ?? 0.75
    }));

    const mapping = await this.prisma.controlMapping.upsert({
      where: {
        sourceControlId_targetControlId: {
          sourceControlId: payload.sourceControlId,
          targetControlId: payload.targetControlId
        }
      },
      create: {
        sourceControlId: payload.sourceControlId,
        targetControlId: payload.targetControlId,
        confidence: payload.confidence ?? 0.9,
        origin: 'MANUAL',
        rationale: payload.rationale?.trim(),
        tags,
        evidenceHints: evidenceWrites?.length
          ? {
              create: evidenceWrites
            }
          : undefined
      },
      update: {
        confidence: payload.confidence ?? 0.9,
        origin: 'MANUAL',
        rationale: payload.rationale?.trim(),
        tags,
        evidenceHints: {
          deleteMany: {},
          ...(evidenceWrites?.length
            ? {
                create: evidenceWrites
              }
            : {})
        }
      },
      include: {
        sourceControl: true,
        targetControl: true,
        evidenceHints: true
      }
    });

    return this.toCrosswalkMatch(mapping);
  }

  private generateSuggestions(
    sourceControls: Control[],
    targetControls: Control[],
    existingPairs: Set<string>,
    minConfidence: number
  ): CrosswalkMatch[] {
    if (!sourceControls.length || !targetControls.length) {
      return [];
    }

    const sourceProfiles = sourceControls
      .map((control) => this.buildTokenProfile(control))
      .filter((profile): profile is TokenProfile => profile.tokens.length > 0);

    const targetProfiles = targetControls
      .map((control) => this.buildTokenProfile(control))
      .filter((profile): profile is TokenProfile => profile.tokens.length > 0);

    const suggestions: CrosswalkMatch[] = [];

    for (const profile of sourceProfiles) {
      const candidates = targetProfiles
        .map((target) => {
          const key = this.buildKey(profile.control.id, target.control.id);

          if (existingPairs.has(key)) {
            return null;
          }

          const score = this.cosine(profile.vector, target.vector);

          if (Number.isNaN(score) || score < minConfidence) {
            return null;
          }

          const matchedTerms = this.intersection(profile.termSet, target.termSet).slice(0, 5);

          return {
            target,
            score,
            matchedTerms
          };
        })
        .filter((candidate): candidate is { target: TokenProfile; score: number; matchedTerms: string[] } => candidate !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, this.maxSuggestionsPerControl);

      for (const candidate of candidates) {
        const normalizedScore = Number(candidate.score.toFixed(3));
        const tags = this.normalizeTags(candidate.matchedTerms).slice(0, 3);
        const match: CrosswalkMatch = {
          id: `suggested:${profile.control.id}:${candidate.target.control.id}`,
          source: this.toControlReference(profile.control),
          target: this.toControlReference(candidate.target.control),
          confidence: normalizedScore,
          origin: 'ALGO',
          tags,
          rationale: `Suggested via keyword similarity. Score ${normalizedScore}.`,
          evidenceHints: [],
          status: 'suggested',
          similarityBreakdown: {
            score: normalizedScore,
            matchedTerms: candidate.matchedTerms
          }
        };

        suggestions.push(match);
        existingPairs.add(this.buildKey(profile.control.id, candidate.target.control.id));
      }
    }

    return suggestions;
  }

  private toCrosswalkMatch(
    mapping: ControlMapping & {
      sourceControl: Control;
      targetControl: Control;
      evidenceHints: ControlMappingEvidenceHint[];
    }
  ): CrosswalkMatch {
    return {
      id: mapping.id,
      source: this.toControlReference(mapping.sourceControl),
      target: this.toControlReference(mapping.targetControl),
      confidence: Number(mapping.confidence.toFixed(3)),
      origin: mapping.origin as ControlMappingOrigin,
      tags: this.normalizeTags(mapping.tags),
      rationale: mapping.rationale ?? undefined,
      evidenceHints: mapping.evidenceHints.map((hint) => this.toEvidenceHint(hint)),
      status: mapping.origin === 'MANUAL' ? 'mapped' : 'mapped',
      similarityBreakdown: undefined
    };
  }

  private toControlReference(control: Control): ControlReference {
    return {
      id: control.id,
      frameworkId: control.frameworkId,
      title: control.title,
      family: control.family,
      metadata: this.parseMetadata(control.metadata)
    };
  }

  private toEvidenceHint(hint: ControlMappingEvidenceHint): EvidenceReuseHint {
    return {
      id: hint.id,
      summary: hint.summary,
      rationale: hint.rationale ?? undefined,
      score: Number(hint.score.toFixed(3)),
      evidenceId: hint.evidenceId ?? undefined
    };
  }

  private parseMetadata(value: Control['metadata']): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object') {
      return undefined;
    }
    return value as Record<string, unknown>;
  }

  private buildTokenProfile(control: Control): TokenProfile {
    const rawText = [control.id, control.title, control.description, control.family]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const tokens = rawText
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

    const vector = new Map<string, number>();

    for (const token of tokens) {
      vector.set(token, (vector.get(token) ?? 0) + 1);
    }

    const termSet = new Set(tokens);

    return {
      control,
      tokens,
      termSet,
      vector
    };
  }

  private cosine(left: Map<string, number>, right: Map<string, number>): number {
    let dotProduct = 0;
    let leftMagnitudeSquared = 0;
    let rightMagnitudeSquared = 0;

    for (const value of left.values()) {
      leftMagnitudeSquared += value * value;
    }

    for (const value of right.values()) {
      rightMagnitudeSquared += value * value;
    }

    const smaller = left.size < right.size ? left : right;
    const larger = smaller === left ? right : left;

    for (const [term, value] of smaller.entries()) {
      const other = larger.get(term);
      if (other) {
        dotProduct += value * other;
      }
    }

    const denominator = Math.sqrt(leftMagnitudeSquared) * Math.sqrt(rightMagnitudeSquared);

    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  private intersection(left: Set<string>, right: Set<string>): string[] {
    const [smaller, larger] = left.size < right.size ? [left, right] : [right, left];
    const matches: string[] = [];

    for (const term of smaller) {
      if (larger.has(term)) {
        matches.push(term);
      }
    }

    return matches;
  }

  private normalizeTags(tags?: string[]): string[] {
    if (!tags?.length) {
      return [];
    }

    const unique = new Set<string>();

    for (const tag of tags) {
      const normalized = tag.trim().toLowerCase();
      if (normalized) {
        unique.add(normalized);
      }
    }

    return Array.from(unique).slice(0, 10);
  }

  private buildKey(sourceId: string, targetId: string): string {
    return `${sourceId}::${targetId}`;
  }

}
