import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";

import { FfxivModule } from "./ffxiv/ffxiv.module";

@Module({
	imports: [
		CacheModule.register({
			isGlobal: true,
		}),
		FfxivModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
