import { DeepMocked, createMock } from "@golevelup/ts-jest";
import { Test } from "@nestjs/testing";

import { Registry as PrometheusRegistry } from "prom-client";

import { FfxivPrometheusService } from "./ffxiv-prometheus.service";
import { FfxivController } from "./ffxiv.controller";
import { FfxivService } from "./ffxiv.service";

import { ServerCategory } from "./enums/server-category.enum";
import { ServerStatus } from "./enums/server-status.enum";

describe("FfxivController", () => {
	let ffxivController: FfxivController;
	let ffxivService: DeepMocked<FfxivService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [FfxivController],
			providers: [
				FfxivPrometheusService,
				{
					provide: "FfxivPrometheusRegistry",
					useClass: PrometheusRegistry,
				},
				{
					provide: FfxivService,
					useValue: createMock<FfxivService>(),
				},
			],
		}).compile();

		ffxivController = moduleRef.get<FfxivController>(FfxivController);

		ffxivService = moduleRef.get(FfxivService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getPrometheus", () => {
		it("returns no metrics if there's no data", async () => {
			jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(async () => {
				return [];
			});

			const result: string = await ffxivController.getPrometheus();

			expect(result).toEqual(
				[
					"# HELP ffxiv_server_online_status FFXIV server online status.",
					"# TYPE ffxiv_server_online_status gauge",
					"",
					"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
					"# TYPE ffxiv_server_character_creation_available gauge",
					"",
				].join("\n"),
			);
		});

		it("includes information about all known worlds", async () => {
			jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
				Promise.resolve(
					[
						{ group: "Example group name", name: "Example world name" },
						{ group: "Chaos", name: "Omega" },
					].map((world) => ({
						group: world.group,
						name: world.name,
						serverStatus: ServerStatus.Online,

						// Not required for the test.
						category: ServerCategory.Standard,
						canCreateNewCharacters: false,
					})),
				),
			);

			const result: string = await ffxivController.getPrometheus();

			expect(result).toEqual(
				[
					"# HELP ffxiv_server_online_status FFXIV server online status.",
					"# TYPE ffxiv_server_online_status gauge",
					`ffxiv_server_online_status{ffxiv_group="Example group name",ffxiv_world="Example world name"} 1`,
					`ffxiv_server_online_status{ffxiv_group="Chaos",ffxiv_world="Omega"} 1`,
					"",
					"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
					"# TYPE ffxiv_server_character_creation_available gauge",
					`ffxiv_server_character_creation_available{ffxiv_group="Example group name",ffxiv_world="Example world name"} 0`,
					`ffxiv_server_character_creation_available{ffxiv_group="Chaos",ffxiv_world="Omega"} 0`,
					"",
				].join("\n"),
			);
		});

		// Even though it's not every day that a new group (datacenter) or world
		// (server) are added, these tests should still make sure that we're
		// handling such situation in a robust way.

		it("automatically creates a metric when a new group is added", async () => {
			jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
				Promise.resolve([
					{
						group: "Light",
						name: "Alpha",
						serverStatus: ServerStatus.Online,

						// Not required for the test.
						category: ServerCategory.Standard,
						canCreateNewCharacters: false,
					},
				]),
			);

			const firstResult: string = await ffxivController.getPrometheus();

			jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
				Promise.resolve([
					{
						group: "Light",
						name: "Alpha",
						serverStatus: ServerStatus.Online,

						// Not required for the test.
						category: ServerCategory.Standard,
						canCreateNewCharacters: false,
					},
					{
						group: "Chaos",
						name: "Cerberus",
						serverStatus: ServerStatus.Online,

						// Not required for the test.
						category: ServerCategory.Standard,
						canCreateNewCharacters: false,
					},
				]),
			);

			const secondResult: string = await ffxivController.getPrometheus();

			expect(firstResult).toEqual(
				[
					"# HELP ffxiv_server_online_status FFXIV server online status.",
					"# TYPE ffxiv_server_online_status gauge",
					`ffxiv_server_online_status{ffxiv_group="Light",ffxiv_world="Alpha"} 1`,
					"",
					"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
					"# TYPE ffxiv_server_character_creation_available gauge",
					`ffxiv_server_character_creation_available{ffxiv_group="Light",ffxiv_world="Alpha"} 0`,
					"",
				].join("\n"),
			);

			expect(secondResult).toEqual(
				[
					"# HELP ffxiv_server_online_status FFXIV server online status.",
					"# TYPE ffxiv_server_online_status gauge",
					`ffxiv_server_online_status{ffxiv_group="Light",ffxiv_world="Alpha"} 1`,
					`ffxiv_server_online_status{ffxiv_group="Chaos",ffxiv_world="Cerberus"} 1`,
					"",
					"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
					"# TYPE ffxiv_server_character_creation_available gauge",
					`ffxiv_server_character_creation_available{ffxiv_group="Light",ffxiv_world="Alpha"} 0`,
					`ffxiv_server_character_creation_available{ffxiv_group="Chaos",ffxiv_world="Cerberus"} 0`,
					"",
				].join("\n"),
			);
		});

		it("automatically creates a metric when a new world is added", async () => {
			jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
				Promise.resolve([
					{
						group: "Light",
						name: "Alpha",
						serverStatus: ServerStatus.Online,

						// Not required for the test.
						category: ServerCategory.Standard,
						canCreateNewCharacters: false,
					},
				]),
			);

			const firstResult: string = await ffxivController.getPrometheus();

			jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
				Promise.resolve([
					{
						group: "Light",
						name: "Alpha",
						serverStatus: ServerStatus.Online,

						// Not required for the test.
						category: ServerCategory.Standard,
						canCreateNewCharacters: false,
					},
					{
						group: "Light",
						name: "Lich",
						serverStatus: ServerStatus.Online,

						// Not required for the test.
						category: ServerCategory.Standard,
						canCreateNewCharacters: false,
					},
				]),
			);

			const secondResult: string = await ffxivController.getPrometheus();

			expect(firstResult).toEqual(
				[
					"# HELP ffxiv_server_online_status FFXIV server online status.",
					"# TYPE ffxiv_server_online_status gauge",
					`ffxiv_server_online_status{ffxiv_group="Light",ffxiv_world="Alpha"} 1`,
					"",
					"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
					"# TYPE ffxiv_server_character_creation_available gauge",
					`ffxiv_server_character_creation_available{ffxiv_group="Light",ffxiv_world="Alpha"} 0`,
					"",
				].join("\n"),
			);

			expect(secondResult).toEqual(
				[
					"# HELP ffxiv_server_online_status FFXIV server online status.",
					"# TYPE ffxiv_server_online_status gauge",
					`ffxiv_server_online_status{ffxiv_group="Light",ffxiv_world="Alpha"} 1`,
					`ffxiv_server_online_status{ffxiv_group="Light",ffxiv_world="Lich"} 1`,
					"",
					"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
					"# TYPE ffxiv_server_character_creation_available gauge",
					`ffxiv_server_character_creation_available{ffxiv_group="Light",ffxiv_world="Alpha"} 0`,
					`ffxiv_server_character_creation_available{ffxiv_group="Light",ffxiv_world="Lich"} 0`,
					"",
				].join("\n"),
			);
		});

		describe("metric `ffxiv_server_online_status`", () => {
			it("sets gauge value to `1` for online servers", async () => {
				jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
					Promise.resolve([
						{
							group: "Chaos",
							name: "Omega",
							serverStatus: ServerStatus.Online,

							// Not required for the test.
							category: ServerCategory.Standard,
							canCreateNewCharacters: false,
						},
					]),
				);

				const result: string = await ffxivController.getPrometheus();

				expect(result).toEqual(
					[
						"# HELP ffxiv_server_online_status FFXIV server online status.",
						"# TYPE ffxiv_server_online_status gauge",
						`ffxiv_server_online_status{ffxiv_group="Chaos",ffxiv_world="Omega"} 1`,
						"",
						"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
						"# TYPE ffxiv_server_character_creation_available gauge",
						`ffxiv_server_character_creation_available{ffxiv_group="Chaos",ffxiv_world="Omega"} 0`,
						"",
					].join("\n"),
				);
			});

			it("sets gauge value to `0` for servers in maintenance", async () => {
				jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
					Promise.resolve([
						{
							group: "Chaos",
							name: "Omega",
							serverStatus: ServerStatus.Maintenance,

							// Not required for the test.
							category: ServerCategory.Standard,
							canCreateNewCharacters: false,
						},
					]),
				);

				const result: string = await ffxivController.getPrometheus();

				expect(result).toEqual(
					[
						"# HELP ffxiv_server_online_status FFXIV server online status.",
						"# TYPE ffxiv_server_online_status gauge",
						`ffxiv_server_online_status{ffxiv_group="Chaos",ffxiv_world="Omega"} 0`,
						"",
						"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
						"# TYPE ffxiv_server_character_creation_available gauge",
						`ffxiv_server_character_creation_available{ffxiv_group="Chaos",ffxiv_world="Omega"} 0`,
						"",
					].join("\n"),
				);
			});

			it("sets gauge value to `0` for servers in partial maintenance", async () => {
				jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
					Promise.resolve([
						{
							group: "Chaos",
							name: "Omega",
							serverStatus: ServerStatus.PartialMaintenance,

							// Not required for the test.
							category: ServerCategory.Standard,
							canCreateNewCharacters: false,
						},
					]),
				);

				const result: string = await ffxivController.getPrometheus();

				expect(result).toEqual(
					[
						"# HELP ffxiv_server_online_status FFXIV server online status.",
						"# TYPE ffxiv_server_online_status gauge",
						`ffxiv_server_online_status{ffxiv_group="Chaos",ffxiv_world="Omega"} 0`,
						"",
						"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
						"# TYPE ffxiv_server_character_creation_available gauge",
						`ffxiv_server_character_creation_available{ffxiv_group="Chaos",ffxiv_world="Omega"} 0`,
						"",
					].join("\n"),
				);
			});
		});

		describe("metric `ffxiv_server_character_creation_available`", () => {
			it("sets gauge value to `1` when character creation is available", async () => {
				jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
					Promise.resolve([
						{
							group: "Chaos",
							name: "Omega",
							canCreateNewCharacters: true,

							// Not required for the test.
							category: ServerCategory.Standard,
							serverStatus: ServerStatus.Online,
						},
					]),
				);

				const result: string = await ffxivController.getPrometheus();

				expect(result).toEqual(
					[
						"# HELP ffxiv_server_online_status FFXIV server online status.",
						"# TYPE ffxiv_server_online_status gauge",
						`ffxiv_server_online_status{ffxiv_group="Chaos",ffxiv_world="Omega"} 1`,
						"",
						"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
						"# TYPE ffxiv_server_character_creation_available gauge",
						`ffxiv_server_character_creation_available{ffxiv_group="Chaos",ffxiv_world="Omega"} 1`,
						"",
					].join("\n"),
				);
			});

			it("sets gauge value to `0` when character creation is not available", async () => {
				jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
					Promise.resolve([
						{
							group: "Chaos",
							name: "Omega",
							canCreateNewCharacters: false,

							// Not required for the test.
							category: ServerCategory.Standard,
							serverStatus: ServerStatus.Online,
						},
					]),
				);

				const result: string = await ffxivController.getPrometheus();

				expect(result).toEqual(
					[
						"# HELP ffxiv_server_online_status FFXIV server online status.",
						"# TYPE ffxiv_server_online_status gauge",
						`ffxiv_server_online_status{ffxiv_group="Chaos",ffxiv_world="Omega"} 1`,
						"",
						"# HELP ffxiv_server_character_creation_available FFXIV character creation available.",
						"# TYPE ffxiv_server_character_creation_available gauge",
						`ffxiv_server_character_creation_available{ffxiv_group="Chaos",ffxiv_world="Omega"} 0`,
						"",
					].join("\n"),
				);
			});
		});
	});
});
