import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as multer from 'multer';
import { PolicyService } from './policy.service';
import { PolicyActorGuard } from './policy-actor.guard';
import { PolicyActor } from './policy-actor.decorator';
import {
  PolicyActor as PolicyActorContext,
  PolicyDetail,
  PolicyParticipantGroups,
  PolicySummary,
  PolicyVersionView
} from './policy.types';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { CreatePolicyVersionDto } from './dto/create-policy-version.dto';
import { SubmitPolicyVersionDto } from './dto/submit-policy-version.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { ApprovalDecisionDto } from './dto/approval-decision.dto';
import { UpdatePolicyVersionDto } from './dto/update-policy-version.dto';

@Controller('policies')
@UseGuards(PolicyActorGuard)
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get('actors')
  async listParticipants(@PolicyActor() actor: PolicyActorContext): Promise<PolicyParticipantGroups> {
    return this.policyService.listParticipants(actor);
  }

  @Get()
  async list(@PolicyActor() actor: PolicyActorContext): Promise<PolicySummary[]> {
    return this.policyService.listPolicies(actor);
  }

  @Get(':policyId')
  async detail(
    @Param('policyId') policyId: string,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyDetail> {
    return this.policyService.getPolicy(policyId, actor);
  }

  @Post()
  async create(
    @Body() dto: CreatePolicyDto,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyDetail> {
    return this.policyService.createPolicy(actor, dto);
  }

  @Patch(':policyId')
  async update(
    @Param('policyId') policyId: string,
    @Body() dto: UpdatePolicyDto,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyDetail> {
    return this.policyService.updatePolicy(policyId, actor, dto);
  }

  @Post(':policyId/versions')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 25 * 1024 * 1024
      }
    })
  )
  async createVersion(
    @Param('policyId') policyId: string,
    @Body() dto: CreatePolicyVersionDto,
    @UploadedFile() file: Express.Multer.File,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyVersionView> {
    if (!file) {
      throw new BadRequestException('A policy document file must be provided.');
    }

    return this.policyService.createVersion(policyId, actor, dto, file);
  }

  @Patch(':policyId/versions/:versionId')
  async updateVersion(
    @Param('policyId') policyId: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdatePolicyVersionDto,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyVersionView> {
    return this.policyService.updateVersion(policyId, versionId, actor, dto);
  }

  @Delete(':policyId/versions/:versionId')
  async deleteVersion(
    @Param('policyId') policyId: string,
    @Param('versionId') versionId: string,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyDetail> {
    return this.policyService.deleteVersion(policyId, versionId, actor);
  }

  @Post(':policyId/versions/:versionId/submit')
  async submitForApproval(
    @Param('policyId') policyId: string,
    @Param('versionId') versionId: string,
    @Body() dto: SubmitPolicyVersionDto,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyVersionView> {
    return this.policyService.submitForApproval(policyId, versionId, actor, dto);
  }

  @Post(':policyId/versions/:versionId/decision')
  async recordDecision(
    @Param('policyId') policyId: string,
    @Param('versionId') versionId: string,
    @Body() dto: ApprovalDecisionDto,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<PolicyVersionView> {
    return this.policyService.recordDecision(policyId, versionId, actor, dto);
  }

  @Get(':policyId/versions/:versionId/download')
  async download(
    @Param('policyId') policyId: string,
    @Param('versionId') versionId: string,
    @Res() res: Response,
    @PolicyActor() actor: PolicyActorContext
  ): Promise<void> {
    const artifact = await this.policyService.getVersionArtifact(
      policyId,
      versionId,
      actor
    );

    res.setHeader('Content-Type', artifact.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${artifact.filename.replace(/"/g, '')}"`
    );

    res.sendFile(artifact.path);
  }
}
