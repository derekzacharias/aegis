import {
  Body,
  Controller,
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

@Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<EvidenceRecord[]> {
    return this.evidenceService.list(user.organizationId);
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
}
