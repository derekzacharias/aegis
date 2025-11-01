import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ControlMappingOrigin } from '@prisma/client';
import type { CrosswalkResponse } from './framework.types';
import { CrosswalkService } from './crosswalk.service';

const buildControl = (overrides = {}) => ({
  id: 'control-default',
  frameworkId: 'framework-a',
  title: 'Default Control',
  family: 'General',
  description: 'Default description',
  priority: 'P1',
  ...overrides
});

describe('CrosswalkService', () => {
  const frameworkFindUnique = jest.fn();
  const controlFindMany = jest.fn();
  const controlFindUnique = jest.fn();
  const controlMappingFindMany = jest.fn();
  const controlMappingUpsert = jest.fn();

  const prisma = {
    framework: { findUnique: frameworkFindUnique },
    control: { findMany: controlFindMany, findUnique: controlFindUnique },
    controlMapping: { findMany: controlMappingFindMany, upsert: controlMappingUpsert }
  };

  let service: CrosswalkService;

  beforeEach(() => {
    frameworkFindUnique.mockReset();
    controlFindMany.mockReset();
    controlFindUnique.mockReset();
    controlMappingFindMany.mockReset();
    controlMappingUpsert.mockReset();
    // @ts-expect-error lightweight prisma mock for unit tests
    service = new CrosswalkService(prisma);
  });

  it('returns persisted mappings and algorithmic suggestions when generating a crosswalk', async () => {
    frameworkFindUnique.mockResolvedValue({ id: 'nist-800-53-rev5' });

    const ra5 = buildControl({
      id: 'ra-5',
      frameworkId: 'nist-800-53-rev5',
      title: 'Vulnerability Monitoring and Scanning',
      description: 'Monitor and scan for vulnerabilities and remediate findings.'
    });
    const ia2 = buildControl({
      id: 'ia-2',
      frameworkId: 'nist-800-53-rev5',
      title: 'Identification and Authentication',
      description: 'Require multi factor authentication for privileged accounts.'
    });

    const cis41 = buildControl({
      id: 'cis-4-1',
      frameworkId: 'cis-v8',
      title: 'Establish Vulnerability Management',
      description: 'Maintain an authenticated vulnerability scanning program.'
    });
    const pci826 = buildControl({
      id: 'pci-8-2-6',
      frameworkId: 'pci-dss-4-0',
      title: 'Privileged MFA Enforcement',
      description: 'Enforce multi factor authentication for all privileged accounts.'
    });

    controlFindMany
      .mockResolvedValueOnce([ra5, ia2])
      .mockResolvedValueOnce([cis41, pci826]);

    controlMappingFindMany.mockResolvedValue([
      {
        id: 'mapping-1',
        sourceControlId: 'ra-5',
        targetControlId: 'cis-4-1',
        confidence: 0.8,
        tags: ['vulnerability'],
        origin: ControlMappingOrigin.SEED,
        rationale: 'Seeded mapping',
        sourceControl: ra5,
        targetControl: cis41,
        evidenceHints: [
          {
            id: 'hint-1',
            mappingId: 'mapping-1',
            evidenceId: 'evidence-ra5',
            summary: 'Monthly authenticated scans',
            rationale: 'Demonstrates coverage for both controls',
            score: 0.8
          }
        ]
      }
    ]);

    const result = await service.generateCrosswalk('nist-800-53-rev5', {});
    type Match = CrosswalkResponse['matches'][number];

    expect(controlFindMany).toHaveBeenCalledTimes(2);
    expect(controlMappingFindMany).toHaveBeenCalledTimes(1);
    expect(result.matches.some((match: Match) => match.status === 'mapped')).toBe(true);
    expect(result.matches.some((match: Match) => match.status === 'suggested')).toBe(true);

    const mapped = result.matches.find((match: Match) => match.status === 'mapped');
    expect(mapped?.id).toEqual('mapping-1');
    expect(mapped?.evidenceHints).toHaveLength(1);

    const suggestion = result.matches.find((match: Match) => match.status === 'suggested');
    expect(suggestion?.source.id).toEqual('ia-2');
    expect(suggestion?.target.id).toEqual('pci-8-2-6');
    expect(suggestion?.confidence).toBeGreaterThan(0.35);
    expect(suggestion?.tags.length).toBeGreaterThan(0);
  });

  it('prevents manual mappings that target the same framework', async () => {
    controlFindUnique
      .mockResolvedValueOnce({ id: 'ac-1', frameworkId: 'nist-800-53-rev5' })
      .mockResolvedValueOnce({ id: 'ac-2', frameworkId: 'nist-800-53-rev5' });

    await expect(
      service.upsertManualMapping('nist-800-53-rev5', {
        sourceControlId: 'ac-1',
        targetControlId: 'ac-2',
        confidence: 0.6
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates manual mappings and normalises tags', async () => {
    const source = buildControl({ id: 'ac-1', frameworkId: 'nist-800-53-rev5' });
    const target = buildControl({ id: 'cis-1-1', frameworkId: 'cis-v8' });

    controlFindUnique
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(target);

    controlMappingUpsert.mockResolvedValue({
      id: 'manual-1',
      sourceControlId: source.id,
      targetControlId: target.id,
      confidence: 0.9,
      origin: ControlMappingOrigin.MANUAL,
      tags: ['identity', 'mfa'],
      rationale: 'Manual mapping rationale',
      sourceControl: source,
      targetControl: target,
      evidenceHints: [
        {
          id: 'hint-manual',
          mappingId: 'manual-1',
          evidenceId: undefined,
          summary: 'Analyst provided evidence summary',
          rationale: 'Supports reuse across frameworks',
          score: 0.75
        }
      ]
    });

    const result = await service.upsertManualMapping('nist-800-53-rev5', {
      sourceControlId: source.id,
      targetControlId: target.id,
      confidence: 0.9,
      tags: ['Identity ', 'MFA', 'identity'],
      rationale: 'Manual mapping rationale',
      evidenceHints: [
        {
          summary: 'Analyst provided evidence summary',
          rationale: 'Supports reuse across frameworks',
          score: 0.75
        }
      ]
    });

    expect(controlMappingUpsert).toHaveBeenCalledTimes(1);
    expect(result.id).toEqual('manual-1');
    expect(result.tags).toEqual(['identity', 'mfa']);
    expect(result.status).toEqual('mapped');
  });

  it('throws when referencing a source framework that does not exist', async () => {
    frameworkFindUnique.mockResolvedValue(null);

    await expect(service.generateCrosswalk('unknown', {})).rejects.toBeInstanceOf(NotFoundException);
  });
});
