import { EvidenceStorageProvider } from '@prisma/client';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { EvidenceStorageService } from './evidence-storage.service';

const createConfigService = (overrides: Record<string, unknown> = {}) => ({
  get: jest.fn((key: string) => {
    if (key in overrides) {
      return overrides[key];
    }

    if (key === 'storage.localDir') {
      return '/tmp/evidence';
    }

    if (key === 'storage.bucket') {
      return 'local-evidence';
    }

    if (key === 'storage.mode') {
      return 'local';
    }

    if (key === 'storage.uploadUrlTtlSeconds') {
      return 300;
    }

    return undefined;
  })
});

describe('EvidenceStorageService', () => {
  it('returns relative upload URL when operating in local mode', async () => {
    const config = createConfigService();
    const service = new EvidenceStorageService(config as never);

    const presigned = await service.createPresignedUpload({
      id: 'upload-1',
      storageKey: 'organizations/org/evidence/file.pdf',
      contentType: 'application/pdf',
      sizeInBytes: 1024,
      checksum: `sha256:${'a'.repeat(64)}`,
      authToken: 'token-abc'
    });

    expect(presigned.storageProvider).toBe(EvidenceStorageProvider.LOCAL);
    expect(presigned.uploadUrl).toBe('/api/evidence/uploads/upload-1/file?token=token-abc');
    expect(presigned.requiredHeaders['Content-Type']).toBe('application/pdf');
    expect(presigned.expiresAt).toBeTruthy();
  });

  it('provides readable streams for local storage keys', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'evidence-storage-'));
    const storageKey = 'organizations/acme/evidence/example.txt';
    const targetPath = path.join(tempDir, storageKey);

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, 'sample-data');

    const config = createConfigService({
      'storage.localDir': tempDir
    });
    const service = new EvidenceStorageService(config as never);

    try {
      const handle = await service.createDownloadStream(EvidenceStorageProvider.LOCAL, storageKey);
      const received: Buffer[] = [];
      for await (const chunk of handle.stream) {
        received.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      expect(Buffer.concat(received).toString('utf8')).toBe('sample-data');
      expect(handle.contentLength).toBe(11);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
