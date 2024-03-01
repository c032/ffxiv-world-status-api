import { Injectable, Inject } from "@nestjs/common";
import { Registry, Gauge } from "prom-client";

import { FfxivService } from "./ffxiv.service";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";
import { ServerStatus } from "./enums/server-status.enum";
import { PrometheusLabels } from "./enums/prometheus-labels.enum";

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

  private collectFfxivWorlds(): CollectFunction<Gauge> {
    return async (genericGauge: Gauge) => {
      const allWorlds = await this.getFfxivWorlds();

      allWorlds.forEach((world) => {
        const g = genericGauge.labels({
          [PrometheusLabels.FfxivGroup]: world.group,
          [PrometheusLabels.FfxivWorld]: world.name,
        });

        const isOnline = world.serverStatus === ServerStatus.Online;

        if (isOnline) {
          g.set(1);
        } else {
          g.set(0);
        }
      });
    };
  }

  private async updateMetrics() {
    this.createGauge(
      "ffxiv_server_online_status",
      "FFXIV server online status.",
      [PrometheusLabels.FfxivGroup, PrometheusLabels.FfxivWorld] as const,
      this.collectFfxivWorlds(),
    );
  }

  private async getFfxivWorlds(): Promise<FfxivWorld[]> {
    return this.ffxivService.getAllWorlds();
  }

  private createGauge(
    name: string,
    help: string,
    labels: PrometheusLabels[],
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
      labelNames: labels,
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
