import { Module } from '@nestjs/common';

import { PostgresqlModule } from "../database/postgresql.module";

import { FfxivController } from "./ffxiv.controller";
import { FfxivService } from "./ffxiv.service";

@Module({
  imports: [PostgresqlModule],
  controllers: [FfxivController],
  providers: [FfxivService],
})
export class FfxivModule {}
