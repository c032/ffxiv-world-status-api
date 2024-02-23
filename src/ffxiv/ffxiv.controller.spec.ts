import { Test } from "@nestjs/testing";
import { createMock, DeepMocked } from "@golevelup/ts-jest";

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
          provide: FfxivService,
          useValue: createMock<FfxivService>(),
        },
      ],
    }).compile();

    ffxivController = moduleRef.get<FfxivController>(FfxivController);
    ffxivService = moduleRef.get(FfxivService);
  });

  describe("getPrometheus", () => {
    it("returns Prometheus metrics", async () => {
      jest
        .spyOn(ffxivService, "getAllWorlds")
        .mockImplementationOnce(async () => {
          return [];
        });

      const result: string = await ffxivController.getPrometheus();

      expect(result).toBe(
        [
          "# HELP chaos_omega_online Omega (Chaos) server online status.",
          "# TYPE chaos_omega_online gauge",
          "chaos_omega_online 0",
          "",
        ].join("\n"),
      );
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
  });
});
