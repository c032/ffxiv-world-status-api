import { Injectable, Inject } from "@nestjs/common";
import { Registry, Gauge, Metric } from "prom-client";

import { FfxivService } from "./ffxiv.service";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";
import { ServerStatus } from "./enums/server-status.enum";
import { PrometheusLabels } from "./enums/prometheus-labels.enum";

interface CollectFunction<T> {
  (metric: T): Promise<void>;
}

@Injectable()
export class FfxivPrometheusService {
  constructor(
    @Inject("FfxivPrometheusRegistry") private readonly registry: Registry,
    private readonly ffxivService: FfxivService,
  ) {}

  public async getMetrics(): Promise<string> {
    await this.updateMetrics();

    return await this.registry.metrics();
  }

  private collectFfxivWorldOnlineStatus(): CollectFunction<Gauge> {
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

  private collectFfxivWorldCharacterCreationAvailability(): CollectFunction<Gauge> {
    return async (genericGauge: Gauge) => {
      const allWorlds = await this.getFfxivWorlds();

      allWorlds.forEach((world) => {
        const g = genericGauge.labels({
          [PrometheusLabels.FfxivGroup]: world.group,
          [PrometheusLabels.FfxivWorld]: world.name,
        });

        const canCreateNewCharacters = world.canCreateNewCharacters;

        if (canCreateNewCharacters) {
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
      this.collectFfxivWorldOnlineStatus(),
    );

    this.createGauge(
      "ffxiv_server_character_creation_available",
      "FFXIV character creation available.",
      [PrometheusLabels.FfxivGroup, PrometheusLabels.FfxivWorld] as const,
      this.collectFfxivWorldCharacterCreationAvailability(),
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
    const existingMetric: Metric<string> | undefined =
      this.registry.getSingleMetric(name);
    if (existingMetric) {
      if (existingMetric instanceof Gauge) {
        return existingMetric;
      } else {
        throw new Error(`Existing metric is not a gauge: ${name}`);
      }
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

    return gauge;
  }
}
