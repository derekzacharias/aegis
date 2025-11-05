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
import { generateCrosswalkCandidates } from '@compliance/shared';

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

    const warmup = await this.prisma.frameworkWarmupCache.findUnique({
      where: { frameworkId },
      select: {
        crosswalkPayload: true,
        generatedAt: true
      }
    });

    if (warmup?.crosswalkPayload) {
      const cached = warmup.crosswalkPayload as unknown as CrosswalkResponse;
      const filteredMatches = cached.matches.filter((match) => {
        if (filters.targetFrameworkId && match.target.frameworkId !== filters.targetFrameworkId) {
          return false;
        }
        if (filters.minConfidence !== undefined && match.confidence < filters.minConfidence) {
          return false;
        }
        return true;
      });

      return {
        ...cached,
        generatedAt: warmup.generatedAt.toISOString(),
        matches: filteredMatches,
        total: filteredMatches.length,
        filters
      };
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

    const suggestions: CrosswalkMatch[] = [];
    const sourceLookup = new Map(sourceControls.map((control) => [control.id, control]));
    const targetLookup = new Map(targetControls.map((control) => [control.id, control]));

    const candidates = generateCrosswalkCandidates(
      sourceControls.map((control) => ({
        id: control.id,
        frameworkId: control.frameworkId,
        title: control.title,
        description: control.description ?? null,
        family: control.family ?? null
      })),
      targetControls.map((control) => ({
        id: control.id,
        frameworkId: control.frameworkId,
        title: control.title,
        description: control.description ?? null,
        family: control.family ?? null
      })),
      {
        maxSuggestionsPerControl: this.maxSuggestionsPerControl,
        minConfidence
      }
    );

    for (const candidate of candidates) {
      const source = sourceLookup.get(candidate.sourceControlId);
      const target = targetLookup.get(candidate.targetControlId);

      if (!source || !target) {
        continue;
      }

      const key = this.buildKey(candidate.sourceControlId, candidate.targetControlId);
      if (existingPairs.has(key)) {
        continue;
      }

      const normalizedScore = Number(candidate.confidence.toFixed(3));
      const tags = this.normalizeTags(candidate.sharedTerms).slice(0, 3);
      suggestions.push({
        id: `suggested:${source.id}:${target.id}`,
        source: this.toControlReference(source),
        target: this.toControlReference(target),
        confidence: normalizedScore,
        origin: 'ALGO',
        tags,
        rationale: `Suggested via keyword similarity. Score ${normalizedScore}.`,
        evidenceHints: [],
        status: 'suggested',
        similarityBreakdown: {
          score: normalizedScore,
          matchedTerms: candidate.sharedTerms
        }
      });

      existingPairs.add(key);
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
