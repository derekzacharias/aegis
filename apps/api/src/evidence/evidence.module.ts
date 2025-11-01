import { Module } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { EvidenceController } from './evidence.controller';
import { EvidenceStorageService } from './evidence-storage.service';

@Module({
  providers: [EvidenceService, EvidenceStorageService],
  controllers: [EvidenceController],
  exports: [EvidenceService]
})
export class EvidenceModule {}
