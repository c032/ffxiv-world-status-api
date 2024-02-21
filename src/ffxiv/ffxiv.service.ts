import { Injectable } from "@nestjs/common";

import { PgClientService } from "../database/pgclient.service";

import { toServerCategory, toServerStatus, toFfxivWorld } from "./ffxiv.mapper";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";

import { getAllWorldsQuery } from "./queries/get-all-worlds.query";
import { getWorldGroupQuery } from "./queries/get-world-group.query";
import { getWorldQuery } from "./queries/get-world.query";

@Injectable()
export class FfxivService {
  constructor(private readonly pgClientService: PgClientService) {}

  public async getAllWorlds(): Promise<FfxivWorld[]> {
    return this.pgClientService.withClient<FfxivWorld[]>(async (client) => {
      const worldsDto = await getAllWorldsQuery.run({}, client);

      const worlds: FfxivWorld[] = worldsDto.map((row) => toFfxivWorld(row));

      return worlds;
    });
  }

  public async getWorldGroup(worldGroupName: string): Promise<FfxivWorld[]> {
    return this.pgClientService.withClient<FfxivWorld[]>(async (client) => {
      const worldsDto = await getWorldGroupQuery.run(
        {
          groupName: worldGroupName,
        },
        client,
      );

      const worlds: FfxivWorld[] = worldsDto.map((row) => toFfxivWorld(row));

      return worlds;
    });
  }

  public async getWorld(
    worldGroupName: string,
    worldName: string,
  ): Promise<FfxivWorld | null> {
    return this.pgClientService.withClient<FfxivWorld | null>(
      async (client) => {
        const worldsDto = await getWorldQuery.run(
          {
            groupName: worldGroupName,
            worldName: worldName,
          },
          client,
        );

        const worlds: FfxivWorld[] = worldsDto.map((row) => toFfxivWorld(row));

        const world = worlds[0];
        if (!world) {
          return null;
        }

        return world;
      },
    );
  }
}
