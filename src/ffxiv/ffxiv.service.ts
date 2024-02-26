import { Injectable } from "@nestjs/common";

import { DbConnectionService } from "../database/dbconnection.service";

import { toFfxivWorld } from "./ffxiv.mapper";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";

import { getAllWorldsQuery } from "./queries/get-all-worlds.query";
import { getWorldGroupQuery } from "./queries/get-world-group.query";
import { getWorldQuery } from "./queries/get-world.query";

@Injectable()
export class FfxivService {
  constructor(private readonly db: DbConnectionService) {}

  public async getAllWorlds(): Promise<FfxivWorld[]> {
    const worldsDto = await getAllWorldsQuery.run({}, this.db);

    const worlds: FfxivWorld[] = worldsDto.map((row) => toFfxivWorld(row));

    return worlds;
  }

  public async getWorldGroup(worldGroupName: string): Promise<FfxivWorld[]> {
    const worldsDto = await getWorldGroupQuery.run(
      {
        groupName: worldGroupName,
      },
      this.db,
    );

    const worlds: FfxivWorld[] = worldsDto.map((row) => toFfxivWorld(row));

    return worlds;
  }

  public async getWorld(
    worldGroupName: string,
    worldName: string,
  ): Promise<FfxivWorld | null> {
    const worldsDto = await getWorldQuery.run(
      {
        groupName: worldGroupName,
        worldName: worldName,
      },
      this.db,
    );

    const worlds: FfxivWorld[] = worldsDto.map((row) => toFfxivWorld(row));

    const world = worlds[0];
    if (!world) {
      return null;
    }

    return world;
  }
}
