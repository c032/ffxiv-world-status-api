import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { ConfigModule } from "./config/config.module";
import { PostgresqlModule } from "./database/postgresql.module";
import { PgClientService } from "./database/pgclient.service";
import { FfxivModule } from "./ffxiv/ffxiv.module";

@Module({
  imports: [ConfigModule, PostgresqlModule, FfxivModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
