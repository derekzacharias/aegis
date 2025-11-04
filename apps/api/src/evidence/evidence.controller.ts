import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UserRole } from '@prisma/client';
import {
  EvidenceRecord,
  EvidenceUploadRequestView
} from '@compliance/shared';
import { EvidenceService } from './evidence.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RequestUploadDto } from './dto/request-upload.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { UpdateEvidenceStatusDto } from './dto/update-evidence-status.dto';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceMetadataDto } from './dto/update-evidence-metadata.dto';
import { UpdateEvidenceLinksDto } from './dto/update-evidence-links.dto';
import { ReprocessEvidenceDto } from './dto/reprocess-evidence.dto';

@Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<EvidenceRecord[]> {
    return this.evidenceService.list(user.organizationId);
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') evidenceId: string
  ): Promise<EvidenceRecord> {
    return this.evidenceService.get(user.organizationId, evidenceId);
  }

  @Get(':id/preview')
  async preview(
    @Param('id') evidenceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response
  ): Promise<void> {
    const file = await this.evidenceService.openFileStream(user, evidenceId);
    const safeFilename = (file.filename ?? 'evidence').replace(/"/g, '');

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'no-store');
    if (typeof file.contentLength === 'number') {
      res.setHeader('Content-Length', file.contentLength.toString());
    }

    file.stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });

    res.on('close', () => {
      const maybeDestroy = file.stream as { destroy?: () => void };
      if (typeof maybeDestroy.destroy === 'function') {
        maybeDestroy.destroy();
      }
    });

    file.stream.pipe(res);
  }

  @Get(':id/download')
  async download(
    @Param('id') evidenceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response
  ): Promise<void> {
    const file = await this.evidenceService.openFileStream(user, evidenceId);
    const safeFilename = (file.filename ?? 'evidence').replace(/"/g, '');

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'no-store');
    if (typeof file.contentLength === 'number') {
      res.setHeader('Content-Length', file.contentLength.toString());
    }

    file.stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });

    res.on('close', () => {
      const maybeDestroy = file.stream as { destroy?: () => void };
      if (typeof maybeDestroy.destroy === 'function') {
        maybeDestroy.destroy();
      }
    });

    file.stream.pipe(res);
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Post()
  async quickCreate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateEvidenceDto
  ): Promise<EvidenceRecord> {
    return this.evidenceService.createSimple(user, payload);
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Post(':id/reprocess')
  async reprocess(
    @Param('id') evidenceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ReprocessEvidenceDto
  ): Promise<EvidenceRecord> {
    return this.evidenceService.reprocess(user, evidenceId, payload);
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Post('uploads')
  async requestUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: RequestUploadDto
  ): Promise<EvidenceUploadRequestView> {
    return this.evidenceService.requestUpload(user, payload);
  }

  @Public()
  @Put('uploads/:id/file')
  async uploadFile(
    @Param('id') uploadId: string,
    @Query('token') token: string | string[] | undefined,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const tokenValue = Array.isArray(token) ? token[0] : token;
    await this.evidenceService.handleLocalUpload(uploadId, tokenValue, request);
    response.status(204).send();
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Post('uploads/:id/confirm')
  async confirm(
    @Param('id') uploadId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ConfirmUploadDto
  ): Promise<EvidenceRecord> {
    return this.evidenceService.confirmUpload(user, uploadId, payload);
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') evidenceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateEvidenceStatusDto
  ): Promise<EvidenceRecord> {
    return this.evidenceService.updateStatus(user, evidenceId, payload);
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Patch(':id')
  async updateMetadata(
    @Param('id') evidenceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateEvidenceMetadataDto
  ): Promise<EvidenceRecord> {
    return this.evidenceService.updateMetadata(user, evidenceId, payload);
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Put(':id/assessment-links')
  async syncAssessmentLinks(
    @Param('id') evidenceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateEvidenceLinksDto
  ): Promise<EvidenceRecord> {
    return this.evidenceService.updateAssessmentLinks(user, evidenceId, payload);
  }

  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id') evidenceId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    await this.evidenceService.delete(user, evidenceId);
  }
}
