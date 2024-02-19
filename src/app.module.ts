import { Module } from "@nestjs/common";

import { FfxivModule } from "./ffxiv/ffxiv.module";

@Module({
  imports: [FfxivModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
