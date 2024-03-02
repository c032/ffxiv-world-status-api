import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Header,
} from "@nestjs/common";

import { FfxivService } from "./ffxiv.service";
import {
  toFfxivWorldsResponseDto,
  toFfxivWorldResponseDto,
} from "./ffxiv.mapper";
import { FfxivPrometheusService } from "./ffxiv-prometheus.service";

import { FfxivWorldsResponseDto } from "./dto/ffxiv-worlds-response.dto";
import { FfxivWorldResponseDto } from "./dto/ffxiv-world-response.dto";

@Controller("ffxiv")
export class FfxivController {
  constructor(
    private readonly ffxivService: FfxivService,
    private readonly ffxivPrometheusService: FfxivPrometheusService,
  ) {}

  @Get("/prometheus")
  @Header("Content-Type", "text/plain")
  public async getPrometheus(): Promise<string> {
    const metrics: string = await this.ffxivPrometheusService.getMetrics();
    return metrics;
  }

  @Get("/worlds")
  public async getWorlds(): Promise<FfxivWorldsResponseDto> {
    const worlds = await this.ffxivService.getAllWorlds();
    return toFfxivWorldsResponseDto(worlds);
  }

  /*
  @Get("/history/worlds")
  public async getHistoryWorlds(): Promise<FfxivHistoryWorldsDto> {
  }
  */

  @Get("/worlds/:worldgroup")
  public async getWorldGroup(
    @Param("worldgroup") worldGroupName: string,
  ): Promise<FfxivWorldsResponseDto> {
    const worldGroup = await this.ffxivService.getWorldGroup(worldGroupName);
    if (worldGroup.length === 0) {
      throw new NotFoundException(`No worlds for ${worldGroupName}`);
    }
    return toFfxivWorldsResponseDto(worldGroup);
  }

  @Get("/worlds/:worldgroup/:worldname")
  public async getWorld(
    @Param("worldgroup") worldGroup: string,
    @Param("worldname") worldName: string,
  ): Promise<FfxivWorldResponseDto> {
    const world = await this.ffxivService.getWorld(worldGroup, worldName);
    if (world === null) {
      throw new NotFoundException(
        `Invalid world "${worldName}", group "${worldGroup}", or both.`,
      );
    }

    return toFfxivWorldResponseDto(world);
  }
}
