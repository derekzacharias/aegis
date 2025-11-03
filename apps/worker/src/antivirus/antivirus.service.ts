import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EvidenceScanStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { pipeline } from 'stream/promises';
import type { Readable } from 'stream';
import { ArtifactHandle } from '../storage/artifact-fetcher';
import { AntivirusUnavailableError, AntivirusScanFailureError } from './antivirus.errors';

export interface AntivirusScanContext {
  evidenceId: string;
  scanId: string;
  checksum?: string;
  originalFilename?: string;
}

export interface AntivirusScanOutcome {
  status: EvidenceScanStatus;
  durationMs: number;
  bytesScanned: number;
  engineVersion: string | null;
  signatureVersion: string | null;
  notes: string;
  findings: Record<string, unknown>;
  signature: string | null;
}

@Injectable()
export class AntivirusService {
  private readonly logger = new Logger(AntivirusService.name);
  private readonly engineName: string;
  private readonly cliPath: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    const antivirusConfig = config.get<Record<string, unknown>>('antivirus') ?? {};
    this.engineName = (antivirusConfig['engineName'] as string | undefined) ?? 'ClamAV';

    const clamavConfig = (antivirusConfig['clamav'] as Record<string, unknown> | undefined) ?? {};
    this.cliPath = (clamavConfig['cliPath'] as string | undefined) ?? 'clamdscan';
    this.timeoutMs = Number(clamavConfig['timeoutMs'] ?? antivirusConfig['timeoutMs'] ?? 10000);
  }

  async scan(
    handle: ArtifactHandle,
    context: AntivirusScanContext
  ): Promise<AntivirusScanOutcome> {
    const startedAt = Date.now();
    const tempDir = await this.createTempDir();
    const filename = this.normalizeFilename(
      context.originalFilename ?? `${context.scanId}.bin`
    );
    const tempPath = path.join(tempDir, filename);

    try {
      const { bytes } = await this.writeToTempFile(handle.stream, tempPath);
      const scanResult = await this.invokeClamAv(tempPath);
      const durationMs = Date.now() - startedAt;
      return this.toOutcome(scanResult, bytes, durationMs, context);
    } finally {
      if (handle.cleanup) {
        await handle.cleanup().catch((error) => {
          this.logger.warn(`Failed to cleanup artifact handle: ${(error as Error).message}`);
        });
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch((error) => {
        this.logger.warn(`Failed to remove temporary scan directory: ${(error as Error).message}`);
      });
    }
  }

  private async writeToTempFile(stream: Readable, destination: string): Promise<{ bytes: number }> {
    const target = createWriteStream(destination, { mode: 0o600 });
    await pipeline(stream, target);
    const stats = await fs.stat(destination);
    return { bytes: stats.size };
  }

  private async invokeClamAv(filePath: string): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
  }> {
    const args = ['--stdout', '--no-summary', filePath];
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
      const child = spawn(this.cliPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        reject(
          new AntivirusUnavailableError(
            `ClamAV scan timed out after ${this.timeoutMs}ms`,
            new Error('timeout')
          )
        );
      }, this.timeoutMs);

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      child.stdout?.on('data', (chunk) => {
        stdoutChunks.push(chunk as Buffer);
      });

      child.stderr?.on('data', (chunk) => {
        stderrChunks.push(chunk as Buffer);
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(new AntivirusUnavailableError('Failed to start ClamAV process', error));
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          exitCode: code ?? -1,
          stdout: Buffer.concat(stdoutChunks).toString('utf-8'),
          stderr: Buffer.concat(stderrChunks).toString('utf-8'),
          durationMs: Date.now() - startedAt
        });
      });
    });
  }

  private toOutcome(
    result: { exitCode: number; stdout: string; stderr: string; durationMs: number },
    bytes: number,
    durationMs: number,
    context: AntivirusScanContext
  ): AntivirusScanOutcome {
    const summaryLine = this.extractSummaryLine(result.stdout);
    const parsed = this.parseResult(summaryLine);

    if (result.exitCode > 1) {
      throw new AntivirusUnavailableError(
        `ClamAV scan failed (${result.exitCode})`,
        new Error(result.stderr || result.stdout || 'unknown-error')
      );
    }

    if (!parsed) {
      throw new AntivirusScanFailureError(
        `Unable to parse ClamAV response for evidence ${context.evidenceId}`,
        new Error(result.stdout || 'empty-response')
      );
    }

    const status =
      parsed.status === 'FOUND' ? EvidenceScanStatus.INFECTED : EvidenceScanStatus.CLEAN;

    const findings: Record<string, unknown> = {
      engine: this.engineName,
      raw: result.stdout.trim(),
      stderr: result.stderr.trim() || null,
      exitCode: result.exitCode
    };

    if (parsed.signature) {
      findings['signature'] = parsed.signature;
    }

    return {
      status,
      durationMs,
      bytesScanned: bytes,
      engineVersion: this.engineName,
      signatureVersion: null,
      notes:
        status === EvidenceScanStatus.INFECTED
          ? `Detected ${parsed.signature ?? 'malware signature'}`
          : 'Scan completed successfully',
      findings,
      signature: parsed.signature ?? null
    };
  }

  private extractSummaryLine(stdout: string): string | null {
    const lines = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return null;
    }

    return lines[lines.length - 1];
  }

  private parseResult(line: string | null): { status: 'OK' | 'FOUND'; signature?: string } | null {
    if (!line) {
      return null;
    }

    if (line.endsWith('OK')) {
      return { status: 'OK' };
    }

    const foundMatch = line.match(/:(.+)\s+FOUND$/);
    if (foundMatch) {
      const signature = foundMatch[1].trim();
      return {
        status: 'FOUND',
        signature
      };
    }

    return null;
  }

  private async createTempDir(): Promise<string> {
    const base = path.join(tmpdir(), 'evidence-scan-');
    return fs.mkdtemp(base);
  }

  private normalizeFilename(candidate: string): string {
    const sanitized = candidate
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    if (sanitized) {
      return sanitized;
    }

    return `${randomUUID()}.bin`;
  }
}
