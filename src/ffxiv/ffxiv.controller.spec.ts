import { Test } from "@nestjs/testing";
import { createMock, DeepMocked } from "@golevelup/ts-jest";

import { Registry as PrometheusRegistry } from "prom-client";

import { FfxivController } from "./ffxiv.controller";
import { FfxivService } from "./ffxiv.service";
import { FfxivPrometheusService } from "./ffxiv-prometheus.service";

import { ServerStatus } from "./enums/server-status.enum";
import { ServerCategory } from "./enums/server-category.enum";

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

      expect(result).toBe("\n");
    });

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
          "# HELP chaos_omega_online Omega (Chaos) server online status.",
          "# TYPE chaos_omega_online gauge",
          "chaos_omega_online 1",
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
          "# HELP chaos_omega_online Omega (Chaos) server online status.",
          "# TYPE chaos_omega_online gauge",
          "chaos_omega_online 0",
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
          "# HELP chaos_omega_online Omega (Chaos) server online status.",
          "# TYPE chaos_omega_online gauge",
          "chaos_omega_online 0",
          "",
        ].join("\n"),
      );
    });

    it("includes information about all known worlds", async () => {
      jest.spyOn(ffxivService, "getAllWorlds").mockImplementation(() =>
        Promise.resolve(
          [
            { group: "Non-existent group", name: "Non-existent name" },
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
          "# HELP non_existent_group_non_existent_name_online Non-existent name (Non-existent group) server online status.",
          "# TYPE non_existent_group_non_existent_name_online gauge",
          "non_existent_group_non_existent_name_online 1",
          "",
          "# HELP chaos_omega_online Omega (Chaos) server online status.",
          "# TYPE chaos_omega_online gauge",
          "chaos_omega_online 1",
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
          "# HELP light_alpha_online Alpha (Light) server online status.",
          "# TYPE light_alpha_online gauge",
          "light_alpha_online 1",
          "",
        ].join("\n"),
      );

      expect(secondResult).toEqual(
        [
          "# HELP light_alpha_online Alpha (Light) server online status.",
          "# TYPE light_alpha_online gauge",
          "light_alpha_online 1",
          "",
          "# HELP chaos_cerberus_online Cerberus (Chaos) server online status.",
          "# TYPE chaos_cerberus_online gauge",
          "chaos_cerberus_online 1",
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
          "# HELP light_alpha_online Alpha (Light) server online status.",
          "# TYPE light_alpha_online gauge",
          "light_alpha_online 1",
          "",
        ].join("\n"),
      );

      expect(secondResult).toEqual(
        [
          "# HELP light_alpha_online Alpha (Light) server online status.",
          "# TYPE light_alpha_online gauge",
          "light_alpha_online 1",
          "",
          "# HELP light_lich_online Lich (Light) server online status.",
          "# TYPE light_lich_online gauge",
          "light_lich_online 1",
          "",
        ].join("\n"),
      );
    });
  });
});
