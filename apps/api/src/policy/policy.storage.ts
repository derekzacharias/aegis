import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class PolicyStorageService {
  private readonly bucket: string;
  private readonly baseDir: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket =
      this.configService.get<string>('storageBucket') ?? 'local-evidence';
    this.baseDir = path.resolve(process.cwd(), 'tmp', 'policy-artifacts');
  }

  async persist(
    organizationSlug: string,
    policyId: string,
    versionNumber: number,
    file: UploadedFile
  ): Promise<{
    storagePath: string;
    checksum: string;
    absolutePath: string;
    uri: string;
  }> {
    const normalizedOrg = this.sanitizeSegment(organizationSlug);
    const normalizedPolicy = this.sanitizeSegment(policyId);
    const filename = this.buildFilename(file.originalname);
    const storagePath = path
      .posix
      .join(
        'policies',
        normalizedOrg,
        normalizedPolicy,
        `v${versionNumber}`,
        filename
      );

    const absolutePath = this.getAbsolutePath(storagePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, file.buffer);

    const checksum = createHash('sha256').update(file.buffer).digest('hex');

    return {
      storagePath,
      checksum: `sha256:${checksum}`,
      absolutePath,
      uri: this.buildUri(storagePath)
    };
  }

  buildUri(storagePath: string): string {
    const normalized = storagePath.replace(/\\/g, '/');
    return `s3://${this.bucket}/${normalized}`;
  }

  getAbsolutePath(storagePath: string): string {
    const normalized = storagePath.replace(/\\/g, '/');
    const candidate = path.resolve(this.baseDir, normalized);

    if (!candidate.startsWith(this.baseDir)) {
      throw new Error('Attempted to access a policy artifact outside the storage root.');
    }

    return candidate;
  }

  private sanitizeSegment(segment: string): string {
    return segment
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'policy';
  }

  private buildFilename(originalName: string): string {
    const timestamp = Date.now();
    const extension = path.extname(originalName) || '';
    const baseName = originalName.replace(extension, '');
    const normalizedBase = this.sanitizeSegment(baseName);
    const cleanExt = extension.replace(/[^a-z0-9.]/gi, '');
    return `${timestamp}-${normalizedBase}${cleanExt}`;
  }
}
