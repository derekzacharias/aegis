import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EvidenceStorageProvider } from '@prisma/client';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import type { Readable } from 'stream';

type AwsModules = {
  S3Client: new (...args: unknown[]) => AwsClientLike;
  GetObjectCommand: new (...args: unknown[]) => unknown;
};

type AwsClientLike = {
  send: (command: unknown) => Promise<Record<string, unknown>>;
};

export interface ArtifactHandle {
  stream: Readable;
  size?: number;
  cleanup?: () => Promise<void>;
}

@Injectable()
export class ArtifactFetcher {
  private readonly logger = new Logger(ArtifactFetcher.name);
  private readonly mode: string;
  private readonly bucket: string;
  private readonly localDir: string;
  private readonly endpoint: string | null;
  private readonly region: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly usePathStyle: boolean;
  private s3Client: AwsClientLike | null = null;
  private awsModules?: AwsModules;
  private awsModulesLoaded = false;

  constructor(private readonly config: ConfigService) {
    const storage = (config.get<Record<string, unknown>>('storage') ?? {}) as Record<string, unknown>;
    this.mode = (storage['mode'] as string | undefined)?.toLowerCase() ?? 'local';
    this.bucket = (storage['bucket'] as string | undefined) ?? 'local-evidence';
    this.localDir =
      (storage['localDir'] as string | undefined) ??
      path.resolve(process.cwd(), 'tmp', 'evidence');
    this.endpoint =
      ((storage['endpoint'] as string | undefined) ?? null) ||
      (config.get<string>('storageEndpoint') ?? null);
    this.region = (storage['region'] as string | undefined) ?? 'us-east-1';
    this.accessKey = (storage['accessKey'] as string | undefined) ?? '';
    this.secretKey = (storage['secretKey'] as string | undefined) ?? '';
    this.usePathStyle = Boolean(storage['usePathStyle'] ?? true);
  }

  async fetch(
    provider: EvidenceStorageProvider,
    storageKey: string,
    storageUri: string
  ): Promise<ArtifactHandle> {
    if (provider === EvidenceStorageProvider.LOCAL || this.mode === 'local') {
      return this.fetchLocal(storageKey, storageUri);
    }

    return this.fetchS3(storageKey);
  }

  private async fetchLocal(storageKey: string, storageUri: string): Promise<ArtifactHandle> {
    const resolveFromUri = () => {
      if (storageUri.startsWith('file://')) {
        const decoded = decodeURIComponent(storageUri.replace(/^file:\/\//, ''));
        return path.resolve(decoded);
      }
      return null;
    };

    const fromUri = resolveFromUri();
    const candidate = fromUri ?? path.resolve(this.localDir, storageKey);

    if (!candidate.startsWith(this.localDir)) {
      this.logger.warn(`Rejected evidence fetch outside of storage root: ${candidate}`);
      throw new Error('Invalid storage location');
    }

    const stats = await fs.stat(candidate);

    return {
      stream: createReadStream(candidate),
      size: stats.size
    };
  }

  private async fetchS3(storageKey: string): Promise<ArtifactHandle> {
    const { client, modules } = await this.getS3Client();
    const command = new modules.GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey
    });
    const response = await client.send(command);
    const body = response['Body'];

    if (!body) {
      throw new Error('S3 object body missing');
    }

    if (typeof (body as { pipe?: unknown }).pipe !== 'function') {
      throw new Error('S3 object body is not a stream');
    }

    const contentLength = response['ContentLength'];
    const size =
      typeof contentLength === 'number'
        ? contentLength
        : typeof contentLength === 'bigint'
          ? Number(contentLength)
          : undefined;

    return {
      stream: body as Readable,
      size
    };
  }

  private async getS3Client(): Promise<{ client: AwsClientLike; modules: AwsModules }> {
    if (!this.awsModulesLoaded) {
      const [{ S3Client, GetObjectCommand }] = await Promise.all([
        import('@aws-sdk/client-s3')
      ]);
      this.awsModules = {
        S3Client: S3Client as AwsModules['S3Client'],
        GetObjectCommand: GetObjectCommand as AwsModules['GetObjectCommand']
      };
      this.awsModulesLoaded = true;
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
        endpoint: this.endpoint ?? undefined,
        forcePathStyle: this.usePathStyle,
        credentials
      }) as AwsClientLike;
    }

    return {
      client: this.s3Client,
      modules: this.awsModules
    };
  }
}
