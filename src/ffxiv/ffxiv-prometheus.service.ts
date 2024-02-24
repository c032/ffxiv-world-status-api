import { Injectable, Inject } from "@nestjs/common";
import { Registry, Gauge } from "prom-client";

import { FfxivService } from "./ffxiv.service";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";
import { ServerStatus } from "./enums/server-status.enum";

interface CollectFunction<T> {
  (metric: T): Promise<void>;
}

@Injectable()
export class FfxivPrometheusService {
  private ffxivWorlds: Promise<FfxivWorld[]> = Promise.resolve<FfxivWorld[]>(
    [],
  );
  private ffxivWorldsUpdatedAt: number = 0;

  private readonly gauges: Record<string, Gauge | undefined> = {};

  constructor(
    @Inject("FfxivPrometheusRegistry") private readonly registry: Registry,
    private readonly ffxivService: FfxivService,
  ) {}

  public async getMetrics(): Promise<string> {
    await this.updateMetrics();

    return await this.registry.metrics();
  }

  private collectFfxivWorld(
    worldGroup: string,
    worldName: string,
  ): CollectFunction<Gauge> {
    return async (g: Gauge) => {
      const world = await this.getWorld(worldGroup, worldName);

      const isOnline =
        world !== null && world.serverStatus === ServerStatus.Online;

      if (isOnline) {
        g.set(1);
      } else {
        g.set(0);
      }
    };
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

  private async updateMetrics() {
    const worlds = await this.getFfxivWorlds();

    worlds.forEach((world) => {
      const metricName = this.ffxivWorldToMetricName(world.group, world.name);
      const metricHelp = `${world.name} (${world.group}) server online status.`;

      this.createGauge(
        metricName,
        metricHelp,
        this.collectFfxivWorld(world.group, world.name),
      );
    });
  }

  private async getFfxivWorlds(): Promise<FfxivWorld[]> {
    return this.ffxivService.getAllWorlds();
  }

  private createGauge(
    name: string,
    help: string,
    collect: CollectFunction<Gauge>,
  ): Gauge {
    const existingGauge = this.gauges[name];
    if (existingGauge) {
      return existingGauge;
    }

    const gauge = new Gauge({
      name,
      help,
      registers: [this.registry],
      collect: async () => {
        await collect(gauge);
      },
    });

    this.gauges[name] = gauge;

    return gauge;
  }

  private ffxivWorldToMetricName(
    worldGroup: string,
    worldName: string,
  ): string {
    return `${this.toSnakeCase(worldGroup)}_${this.toSnakeCase(worldName)}_online`;
  }

  // TODO: Extract to separate file.
  private toSnakeCase(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");
  }
}
