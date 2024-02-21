import { FfxivWorld } from "./interfaces/ffxiv-world.interface";

import { FfxivWorldDto } from "./dto/ffxiv-world.dto";
import { FfxivWorldResponseDto } from "./dto/ffxiv-world-response.dto";
import { FfxivWorldsResponseDto } from "./dto/ffxiv-worlds-response.dto";

import { ServerCategory } from "./enums/server-category.enum";
import { ServerStatus } from "./enums/server-status.enum";

export function toFfxivWorldDto(world: FfxivWorld): FfxivWorldDto {
  return {
    group: world.group,
    name: world.name,
    category: world.category,
    serverStatus: world.serverStatus,
    canCreateNewCharacters: world.canCreateNewCharacters,

    isOnline: world.serverStatus === ServerStatus.Online,
    isMaintenance:
      world.serverStatus === ServerStatus.Maintenance ||
      world.serverStatus === ServerStatus.PartialMaintenance,

    isCongested: world.category === ServerCategory.Congested,
    isPreferred: world.category === ServerCategory.Preferred,
    isNew: world.category === ServerCategory.New,
  };
}

export function toFfxivWorldResponseDto(
  world: FfxivWorld,
): FfxivWorldResponseDto {
  return {
    world: toFfxivWorldDto(world),
  };
}

export function toFfxivWorldsResponseDto(
  worlds: FfxivWorld[],
): FfxivWorldsResponseDto {
  return {
    worlds: worlds.map<FfxivWorldDto>((world) => toFfxivWorldDto(world)),
  };
}

function isServerCategory(
  maybeServerCategory: string,
): maybeServerCategory is ServerCategory {
  return Object.values(ServerCategory)
    .map((v) => v.toString())
    .includes(maybeServerCategory);
}

export function toServerCategory(maybeServerCategory: string): ServerCategory {
  if (!isServerCategory(maybeServerCategory)) {
    throw new Error(`Not a server category: ${maybeServerCategory}`);
  }

  return maybeServerCategory;
}

function isServerStatus(
  maybeServerStatus: string,
): maybeServerStatus is ServerStatus {
  return Object.values(ServerStatus)
    .map((v) => v.toString())
    .includes(maybeServerStatus);
}

export function toServerStatus(maybeServerStatus: string): ServerStatus {
  if (!isServerStatus(maybeServerStatus)) {
    throw new Error(`Not a server status: ${maybeServerStatus}`);
  }

  return maybeServerStatus;
}
