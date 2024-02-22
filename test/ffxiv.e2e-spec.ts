import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

import { Pool } from "../src/database/types/pool";

import { AppModule } from "./../src/app.module";

describe("FfxivController (e2e)", () => {
  let app: INestApplication;
  let pool: Pool;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    pool = moduleFixture.get("PG_POOL");
  });

  afterEach(async () => {
    await pool.end();
  });

  it("/ffxiv/worlds (GET)", () => {
    return request(app.getHttpServer())
      .get("/ffxiv/worlds")
      .expect(200)
      .expect({ worlds: [] });
  });
});
