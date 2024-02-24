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

  describe("getPrometheus", () => {
    it("returns no metrics if there's no data", async () => {
      jest
        .spyOn(ffxivService, "getAllWorlds")
        .mockImplementationOnce(async () => {
          return [];
        });

      const result: string = await ffxivController.getPrometheus();

      expect(result).toBe("\n");
    });

    it("sets gauge value to `1` for online servers", async () => {
      jest.spyOn(ffxivService, "getAllWorlds").mockImplementationOnce(() =>
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
      jest.spyOn(ffxivService, "getAllWorlds").mockImplementationOnce(() =>
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
      jest.spyOn(ffxivService, "getAllWorlds").mockImplementationOnce(() =>
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
      jest.spyOn(ffxivService, "getAllWorlds").mockImplementationOnce(() =>
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
    it.todo("automatically creates a metric when a new group is added");
    it.todo("automatically creates a metric when a new world is added");
  });
});
