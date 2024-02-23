import { Module } from "@nestjs/common";

import { PostgresqlModule } from "../database/postgresql.module";

import { FfxivController } from "./ffxiv.controller";
import { FfxivService } from "./ffxiv.service";
import { FfxivPrometheusService } from "./ffxiv-prometheus.service";

@Module({
  imports: [PostgresqlModule],
  controllers: [FfxivController],
  providers: [FfxivService, FfxivPrometheusService],
})
export class FfxivModule {}
