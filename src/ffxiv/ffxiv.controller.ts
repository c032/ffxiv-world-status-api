import { Controller, Get, Param, NotFoundException } from "@nestjs/common";

import { FfxivService } from "./ffxiv.service";
import {
  toFfxivWorldsResponseDto,
  toFfxivWorldResponseDto,
} from "./ffxiv.mapper";

import { FfxivWorldsResponseDto } from "./dto/ffxiv-worlds-response.dto";
import { FfxivWorldResponseDto } from "./dto/ffxiv-world-response.dto";

@Controller("ffxiv")
export class FfxivController {
  constructor(private readonly ffxivService: FfxivService) {}

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