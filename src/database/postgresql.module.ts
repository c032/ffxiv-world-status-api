import { Module, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import * as PgPool from "pg-pool";
import { Request } from "express";

import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";

import { DbConnectionService } from "./dbconnection.service";

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    {
      provide: "PG_POOL",
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new PgPool<DbConnectionService>({
          connectionString: config.postgresqlConnectionString,
        }),
    },
    {
      // https://github.com/nestjs/nest/issues/9497#issuecomment-1128787651

      provide: DbConnectionService,
      scope: Scope.REQUEST,
      inject: ["PG_POOL", REQUEST],
      useFactory: async (pool: PgPool<DbConnectionService>, req: Request) => {
        const { res } = req;
        if (!res) {
          throw new Error("Unable to get response object.");
        }

        const client = await pool.connect();
        res.on("finish", () => {
          client.release();
        });

        return client;
      },
    },
  ],
  exports: [DbConnectionService],
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
