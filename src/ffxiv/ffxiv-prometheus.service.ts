import { Injectable } from "@nestjs/common";
import { Registry, Gauge } from "prom-client";

import { FfxivService } from "./ffxiv.service";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";
import { ServerStatus } from "./enums/server-status.enum";

interface CollectFunction<T> {
  (metric: T): Promise<void>;
}

@Injectable()
export class FfxivPrometheusService {
  private readonly registry: Registry = new Registry();

  private ffxivWorlds: Promise<FfxivWorld[]> = Promise.resolve<FfxivWorld[]>(
    [],
  );
  private ffxivWorldsUpdatedAt: number = 0;

  // TODO: Get from config.
  private ffxivWorldsTtlMilliseconds = 15_000;

  constructor(private readonly ffxivService: FfxivService) {
    this.initMetrics();
  }

  private collectFfxivWorld(
    worldGroup: string,
    worldName: string,
  ): CollectFunction<Gauge> {
    return async (g: Gauge) => {
      const world = await this.getWorld("chaos", "omega");

      const isOnline =
        world !== null && world.serverStatus === ServerStatus.Online;

      if (isOnline) {
        g.set(1);
      } else {
        g.set(0);
      }
    };
  }

  private async getFfxivWorlds(): Promise<FfxivWorld[]> {
    const now = Date.now();

    const diff = now - this.ffxivWorldsUpdatedAt;
    if (diff >= this.ffxivWorldsTtlMilliseconds) {
      this.ffxivWorldsUpdatedAt = now;
      this.ffxivWorlds = this.ffxivService.getAllWorlds().catch(() => {
        // TODO: Log error.

        // On error, reset timestamp to zero to force update next time the
        // function is called.
        this.ffxivWorldsUpdatedAt = 0;

        return [];
      });
    }

    return await this.ffxivWorlds;
  }

  private async getWorld(
    groupName: string,
    worldName: string,
  ): Promise<FfxivWorld | null> {
    const allWorlds = await this.getFfxivWorlds();
    const filteredWorlds: FfxivWorld[] = allWorlds.filter(
      (world) =>
        world.group.toLowerCase() === groupName.toLowerCase() &&
        world.name.toLowerCase() === worldName.toLowerCase(),
    );

    const world = filteredWorlds[0] || null;

    return world;
  }

  private initMetrics(): void {
    const ffxivWorldGauges = {
      chaos_omega_online: {
        help: "Omega (Chaos) server online status.",
        collect: this.collectFfxivWorld("chaos", "omega"),
      },
    };

    for (const [key, value] of Object.entries(ffxivWorldGauges)) {
      const { help, collect } = value;
      this.createGauge(key, help, collect);
    }
  }

  private createGauge(
    name: string,
    help: string,
    collect: CollectFunction<Gauge>,
  ): Gauge {
    const gauge = new Gauge({
      name,
      help,
      registers: [this.registry],
      collect: async () => {
        await collect(gauge);
      },
    });

    return gauge;
  }

  public async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}
