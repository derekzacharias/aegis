import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { FrameworkService, FrameworkSummary } from './framework.service';
import { GetFrameworkControlsDto } from './dto/get-controls.dto';
import { CrosswalkService } from './crosswalk.service';
import { GetCrosswalkDto } from './dto/get-crosswalk.dto';
import { UpsertCrosswalkMappingDto } from './dto/upsert-crosswalk-mapping.dto';

@Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
@Controller('frameworks')
export class FrameworkController {
  constructor(
    private readonly frameworkService: FrameworkService,
    private readonly crosswalkService: CrosswalkService
  ) {}

  @Get()
  async list(): Promise<FrameworkSummary[]> {
    return this.frameworkService.list();
  }

  @Get(':frameworkId/controls')
  async listControls(
    @Param('frameworkId') frameworkId: string,
    @Query() query: GetFrameworkControlsDto
  ) {
    const framework = await this.ensureFrameworkExists(frameworkId);

    const catalog = await this.frameworkService.listControls(frameworkId, {
      search: query.search,
      family: query.family,
      priority: query.priority,
      kind: query.type,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25
    });

    return {
      framework,
      ...catalog
    };
  }

  @Get(':frameworkId/crosswalk')
  async getCrosswalk(
    @Param('frameworkId') frameworkId: string,
    @Query() query: GetCrosswalkDto
  ) {
    await this.ensureFrameworkExists(frameworkId);

    return this.crosswalkService.generateCrosswalk(frameworkId, {
      targetFrameworkId: query.targetFrameworkId,
      minConfidence: query.minConfidence
    });
  }

  @Post(':frameworkId/crosswalk')
  async upsertCrosswalk(
    @Param('frameworkId') frameworkId: string,
    @Body() payload: UpsertCrosswalkMappingDto
  ) {
    await this.ensureFrameworkExists(frameworkId);
    return this.crosswalkService.upsertManualMapping(frameworkId, payload);
  }

  private async ensureFrameworkExists(frameworkId: string) {
    const framework = await this.frameworkService.get(frameworkId);

    if (!framework) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    return framework;
  }
}
