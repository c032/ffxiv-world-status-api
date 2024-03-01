import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

import { DbConnectionService } from "../database/dbconnection.service";
import { isArray } from "../lib/narrowing";

import { toFfxivWorld, asFfxivWorld } from "./ffxiv.mapper";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";

import { getAllWorldsQuery } from "./queries/get-all-worlds.query";
import { getWorldGroupQuery } from "./queries/get-world-group.query";
import { getWorldQuery } from "./queries/get-world.query";

@Injectable()
export class FfxivService {
  constructor(
    private readonly db: DbConnectionService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async getAllWorlds(): Promise<FfxivWorld[]> {
    const cacheKey = "ffxiv_all_worlds";
    const ttl = 1000;

    // TODO: Extract this to a service with an interface like:
    //
    //     getFromCache<T>(
    //       ttl: number,
    //       key: string,
    //       getter: () => Promise<T>,
    //     )
    const worldsFromCache = await this.getAllWorldsFromCache(cacheKey);
    if (worldsFromCache) {
      return worldsFromCache;
    }

    const worldsDto = await getAllWorldsQuery.run({}, this.db);

    const worlds: FfxivWorld[] = worldsDto.map((row) => toFfxivWorld(row));

    // TODO: Remove this when the "get from cache" functionality is extracted.
    this.cacheManager.set(cacheKey, worlds, ttl);

    return worlds;
  }

  private async getAllWorldsFromCache(
    cacheKey: string,
  ): Promise<FfxivWorld[] | null> {
    const worldsFromCache: unknown = this.cacheManager.get(cacheKey);
    if (typeof worldsFromCache === "undefined") {
      return null;
    }
    if (!isArray(worldsFromCache)) {
      return null;
    }

    try {
      const worlds: FfxivWorld[] = worldsFromCache.map<FfxivWorld>(
        (input: unknown) => asFfxivWorld(input),
      );

      return worlds;
    } catch (_e) {
      // TODO: Log.

      return null;
    }
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
