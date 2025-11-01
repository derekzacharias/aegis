import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EvidenceStorageProvider } from '@prisma/client';
import { randomBytes } from 'crypto';
import path from 'path';

type StorageMode = 's3' | 'local';

type AwsModules = {
  S3Client: new (...args: unknown[]) => unknown;
  PutObjectCommand: new (...args: unknown[]) => unknown;
  getSignedUrl: (
    client: unknown,
    command: unknown,
    options: { expiresIn: number }
  ) => Promise<string>;
};

export interface PresignedUpload {
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
  storageProvider: EvidenceStorageProvider;
}

export interface PresignRequest {
  id: string;
  storageKey: string;
  contentType: string;
  sizeInBytes: number;
  checksum?: string | null;
  authToken: string;
}

@Injectable()
export class EvidenceStorageService {
  private readonly logger = new Logger(EvidenceStorageService.name);
  private readonly mode: StorageMode;
  private readonly bucket: string;
  private readonly endpoint: string | undefined;
  private readonly region: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly usePathStyle: boolean;
  private readonly uploadUrlTtlSeconds: number;
  private readonly localDir: string;
  private s3Client: unknown;
  private awsModulesLoaded = false;
  private awsModules?: AwsModules;

  constructor(private readonly configService: ConfigService) {
    this.mode = (this.configService.get<string>('storage.mode') ?? 'local') as StorageMode;
    this.bucket = this.configService.get<string>('storage.bucket') ?? 'local-evidence';
    this.endpoint = this.normalizeEmpty(
      this.configService.get<string>('storage.endpoint') ??
        this.configService.get<string>('storageEndpoint') ??
        ''
    );
    this.region = this.configService.get<string>('storage.region') ?? 'us-east-1';
    this.accessKey = this.configService.get<string>('storage.accessKey') ?? '';
    this.secretKey = this.configService.get<string>('storage.secretKey') ?? '';
    this.usePathStyle = this.configService.get<boolean>('storage.usePathStyle') ?? true;
    this.uploadUrlTtlSeconds =
      this.configService.get<number>('storage.uploadUrlTtlSeconds') ?? 60 * 15;
    this.localDir = this.configService.get<string>('storage.localDir') ??
      path.resolve(process.cwd(), 'tmp', 'evidence');

    // S3 client is loaded lazily on first use to avoid hard dependency when
    // running in local mode.
  }

  getLocalDirectory(): string {
    return this.localDir;
  }

  getBucket(): string {
    return this.bucket;
  }

  getMode(): StorageMode {
    return this.mode;
  }

  createUploadToken(): string {
    return randomBytes(24).toString('hex');
  }

  async createPresignedUpload(request: PresignRequest): Promise<PresignedUpload> {
    const expiresAt = new Date(Date.now() + this.uploadUrlTtlSeconds * 1000).toISOString();

    if (this.mode === 's3') {
      const { client, modules } = await this.getS3Client();

      const command = new modules.PutObjectCommand({
        Bucket: this.bucket,
        Key: request.storageKey,
        ContentType: request.contentType,
        ContentLength: request.sizeInBytes,
        ChecksumSHA256: request.checksum ?? undefined
      });

      const uploadUrl = await modules.getSignedUrl(client, command, {
        expiresIn: this.uploadUrlTtlSeconds
      });

      const requiredHeaders: Record<string, string> = {
        'Content-Type': request.contentType
      };

      if (request.checksum) {
        requiredHeaders['x-amz-checksum-sha256'] = request.checksum.replace(/^sha256:/, '');
      }

      return {
        uploadUrl,
        requiredHeaders,
        expiresAt,
        storageProvider: EvidenceStorageProvider.S3
      };
    }

    const uploadUrl = `/api/evidence/uploads/${request.id}/file?token=${request.authToken}`;

    return {
      uploadUrl,
      requiredHeaders: {
        'Content-Type': request.contentType,
        'x-upload-checksum': request.checksum ?? ''
      },
      expiresAt,
      storageProvider: EvidenceStorageProvider.LOCAL
    };
  }

  private normalizeEmpty(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    return value.trim() === '' ? undefined : value;
  }

  private async getS3Client(): Promise<{
    client: unknown;
    modules: AwsModules;
  }> {
    if (!this.awsModulesLoaded) {
      try {
        const [{ S3Client, PutObjectCommand }, { getSignedUrl }] = await Promise.all([
          import('@aws-sdk/client-s3'),
          import('@aws-sdk/s3-request-presigner')
        ]);
        this.awsModules = {
          S3Client: S3Client as AwsModules['S3Client'],
          PutObjectCommand: PutObjectCommand as AwsModules['PutObjectCommand'],
          getSignedUrl: getSignedUrl as AwsModules['getSignedUrl']
        };
        this.awsModulesLoaded = true;
      } catch (error) {
        this.logger.error('Failed to load AWS SDK modules', error as Error);
        throw new Error(
          'AWS SDK modules are required for S3 evidence storage. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner.'
        );
      }
    }

    if (!this.awsModules) {
      throw new Error('AWS SDK modules not available');
    }

    if (!this.s3Client) {
      const credentials =
        this.accessKey && this.secretKey
          ? {
              accessKeyId: this.accessKey,
              secretAccessKey: this.secretKey
            }
          : undefined;

      this.s3Client = new this.awsModules.S3Client({
        region: this.region,
        endpoint: this.endpoint,
        forcePathStyle: this.usePathStyle,
        credentials
      });
    }

    const modules = this.awsModules;
    const client = this.s3Client;

    if (!modules || !client) {
      throw new Error('S3 client is not configured');
    }

    return {
      client,
      modules
    };
  }
}
