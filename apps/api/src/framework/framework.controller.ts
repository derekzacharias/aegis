import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import {
  ControlCatalogResponse,
  FrameworkDetail,
  FrameworkService,
  FrameworkSummary
} from './framework.service';
import { GetFrameworkControlsDto } from './dto/get-controls.dto';
import { CrosswalkService } from './crosswalk.service';
import { GetCrosswalkDto } from './dto/get-crosswalk.dto';
import { UpsertCrosswalkMappingDto } from './dto/upsert-crosswalk-mapping.dto';
import { CreateCustomFrameworkDto } from './dto/create-custom-framework.dto';
import { UpdateCustomFrameworkDto } from './dto/update-custom-framework.dto';
import { UpsertCustomControlsDto } from './dto/upsert-custom-controls.dto';
import { PublishFrameworkDto } from './dto/publish-framework.dto';

@Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
@Controller('frameworks')
export class FrameworkController {
  constructor(
    private readonly frameworkService: FrameworkService,
    private readonly crosswalkService: CrosswalkService
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<FrameworkSummary[]> {
    return this.frameworkService.list(user.organizationId);
  }

  @Get(':frameworkId')
  async getFramework(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string
  ): Promise<FrameworkDetail> {
    const framework = await this.frameworkService.getDetail(user.organizationId, frameworkId);

    if (!framework) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    return framework;
  }

  @Post()
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async createCustomFramework(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCustomFrameworkDto
  ): Promise<FrameworkDetail> {
    return this.frameworkService.createCustomFramework(user.organizationId, user.id, dto);
  }

  @Patch(':frameworkId')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async updateCustomFramework(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string,
    @Body() dto: UpdateCustomFrameworkDto
  ): Promise<FrameworkDetail> {
    await this.ensureFrameworkExists(user.organizationId, frameworkId);
    return this.frameworkService.updateCustomFramework(user.organizationId, user.id, frameworkId, dto);
  }

  @Put(':frameworkId/controls')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async upsertCustomControls(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string,
    @Body() dto: UpsertCustomControlsDto
  ): Promise<FrameworkDetail> {
    await this.ensureFrameworkExists(user.organizationId, frameworkId);
    return this.frameworkService.upsertCustomControls(user.organizationId, user.id, frameworkId, dto);
  }

  @Post(':frameworkId/publish')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  async publishFramework(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string,
    @Body() dto: PublishFrameworkDto
  ): Promise<FrameworkSummary> {
    await this.ensureFrameworkExists(user.organizationId, frameworkId);
    return this.frameworkService.publishFramework(user.organizationId, frameworkId, user.id, dto);
  }

  @Get(':frameworkId/controls')
  async listControls(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string,
    @Query() query: GetFrameworkControlsDto
  ): Promise<ControlCatalogResponse> {
    return this.frameworkService.listControls(user.organizationId, frameworkId, {
      search: query.search,
      family: query.family,
      priority: query.priority,
      kind: query.type,
      status: query.status,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25
    });
  }

  @Get(':frameworkId/crosswalk')
  async getCrosswalk(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string,
    @Query() query: GetCrosswalkDto
  ) {
    await this.ensureFrameworkExists(user.organizationId, frameworkId);

    return this.crosswalkService.generateCrosswalk(frameworkId, {
      targetFrameworkId: query.targetFrameworkId,
      minConfidence: query.minConfidence
    });
  }

  @Post(':frameworkId/crosswalk')
  async upsertCrosswalk(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string,
    @Body() payload: UpsertCrosswalkMappingDto
  ) {
    await this.ensureFrameworkExists(user.organizationId, frameworkId);
    return this.crosswalkService.upsertManualMapping(frameworkId, payload);
  }

  @Delete(':frameworkId')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @HttpCode(204)
  async deleteFramework(
    @CurrentUser() user: AuthenticatedUser,
    @Param('frameworkId') frameworkId: string
  ): Promise<void> {
    await this.frameworkService.deleteCustomFramework(user.organizationId, frameworkId);
  }

  private async ensureFrameworkExists(organizationId: string, frameworkId: string) {
    const framework = await this.frameworkService.get(organizationId, frameworkId);

    if (!framework) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    return framework;
  }
}
