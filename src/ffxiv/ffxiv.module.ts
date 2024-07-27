import { Module } from "@nestjs/common";

import { Registry as PrometheusRegistry } from "prom-client";

import { PostgresqlModule } from "../database/postgresql.module";

import { FfxivController } from "./ffxiv.controller";
import { FfxivService } from "./ffxiv.service";
import { FfxivPrometheusService } from "./ffxiv-prometheus.service";

@Module({
	imports: [PostgresqlModule],
	controllers: [FfxivController],
	providers: [
		FfxivService,
		{
			provide: "FfxivPrometheusRegistry",
			useFactory: () => {
				return new PrometheusRegistry();
			},
		},
		FfxivPrometheusService,
	],
})
export class FfxivModule {}
