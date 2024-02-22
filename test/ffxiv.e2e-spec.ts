import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

import { Pool } from "../src/database/types/pool";

import { FfxivModule } from "./../src/ffxiv/ffxiv.module";

describe("FfxivController (e2e)", () => {
  let app: INestApplication;
  let pool: Pool;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FfxivModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    pool = moduleFixture.get("PG_POOL");
  });

  afterEach(async () => {
    await pool.end();
  });

  describe("GET /ffxiv/worlds", () => {
    it("returns no worlds if the database is empty", () => {
      return request(app.getHttpServer())
        .get("/ffxiv/worlds")
        .expect(200)
        .expect({ worlds: [] });
    });

    it.todo("returns all worlds");

    it.todo("returns only the most recent batch");
  });

  describe("GET /ffxiv/worlds/:worldgroup", () => {
    it.todo("returns only worlds from the given group");
  });

  describe("GET /ffxiv/worlds/:worldgroup/:worldname", () => {
    it.todo("returns only the specific world");

    it.todo("returns 404 if `:worldgroup` is invalid");

    it.todo("returns 404 if `:worldname` is invalid");
  });
});
