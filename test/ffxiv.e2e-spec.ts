import { CacheModule } from "@nestjs/cache-manager";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as pg from "pg";
import PgPool from "pg-pool";
import * as request from "supertest";

import { FfxivModule } from "../src/ffxiv/ffxiv.module";

import allWorlds from "./fixtures/ffxiv/all-worlds.fixture";
import worldAetherCactuar from "./fixtures/ffxiv/world-aether-cactuar.fixture";
import worldGroupAether from "./fixtures/ffxiv/worldgroup-aether.fixture";

describe("FfxivController (e2e)", () => {
	let app: INestApplication;
	let pool: PgPool<pg.Client>;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				CacheModule.register({
					isGlobal: true,
				}),
				FfxivModule,
			],
		}).compile();

		app = moduleFixture.createNestApplication();

		await app.init();

		pool = moduleFixture.get("PG_POOL");
	});

	afterEach(async () => {
		await pool.end();
	});

	describe("GET /ffxiv/worlds", () => {
		it.todo("returns no worlds if the database is empty");

		it("returns all worlds", () => {
			return request(app.getHttpServer())
				.get("/ffxiv/worlds")
				.expect(200)
				.expect({ worlds: allWorlds });
		});

		it.todo("returns only the most recent batch");
	});

	describe("GET /ffxiv/worlds/:worldgroup", () => {
		it("returns only worlds from the given group", () => {
			return request(app.getHttpServer())
				.get("/ffxiv/worlds/aether")
				.expect(200)
				.expect({ worlds: worldGroupAether });
		});
	});

	describe("GET /ffxiv/worlds/:worldgroup/:worldname", () => {
		it("returns only the specific world", () => {
			return request(app.getHttpServer())
				.get("/ffxiv/worlds/aether/cactuar")
				.expect(200)
				.expect({ world: worldAetherCactuar });
		});

		it("returns 404 if `:worldgroup` is invalid", () => {
			return request(app.getHttpServer())
				.get("/ffxiv/worlds/probablynonexistent")
				.expect(404);
		});

		it("returns 404 if `:worldname` is invalid", () => {
			return request(app.getHttpServer())
				.get("/ffxiv/worlds/aether/probablynonexistent")
				.expect(404);
		});
	});
});
