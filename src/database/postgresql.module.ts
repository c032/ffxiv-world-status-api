import { Module } from "@nestjs/common";
import * as PgPool from "pg-pool";

import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";

import { PgClientService } from "./pgclient.service";

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    {
      provide: "PG_POOL",
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new PgPool({
          connectionString: config.postgresqlConnectionString,
        }),
    },
    PgClientService,
  ],
  exports: [PgClientService],
})
export class PostgresqlModule {
  // I could call this "DbModule" or something generic like that, but that
  // would be lying because it would not be abstracting anything.
  //
  // Being realistic, the moment I need to move away from PostgreSQL,
  // everything that directly depends on this module will need to be updated
  // regardless of how much it tries to abstract details away.
  //
  // The database abstractions are the `FfxivService` and those kind of things.
  // Trying to abstract more abstraction than that, would be bringing
  // unnecessary tech debt if I ever change databases.
}
