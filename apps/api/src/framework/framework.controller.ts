import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { FrameworkService, FrameworkSummary } from './framework.service';
import { GetFrameworkControlsDto } from './dto/get-controls.dto';

@Controller('frameworks')
export class FrameworkController {
  constructor(private readonly frameworkService: FrameworkService) {}

  @Get()
  async list(): Promise<FrameworkSummary[]> {
    return this.frameworkService.list();
  }

  @Get(':frameworkId/controls')
  async listControls(
    @Param('frameworkId') frameworkId: string,
    @Query() query: GetFrameworkControlsDto
  ) {
    const framework = await this.frameworkService.get(frameworkId);

    if (!framework) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

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
}
