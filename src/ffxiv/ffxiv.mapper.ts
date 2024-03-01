import { isObject, asString, asBoolean } from "../lib/narrowing";

import { FfxivWorld } from "./interfaces/ffxiv-world.interface";

import { FfxivWorldDto } from "./dto/ffxiv-world.dto";
import { FfxivWorldResponseDto } from "./dto/ffxiv-world-response.dto";
import { FfxivWorldsResponseDto } from "./dto/ffxiv-worlds-response.dto";

import { ServerCategory } from "./enums/server-category.enum";
import { ServerStatus } from "./enums/server-status.enum";

import { GetAllWorldsQueryResult } from "./queries/get-all-worlds.query";
import { GetWorldGroupQueryResult } from "./queries/get-world-group.query";
import { GetWorldQueryResult } from "./queries/get-world.query";

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

export function toFfxivWorld(
  row: GetAllWorldsQueryResult | GetWorldGroupQueryResult | GetWorldQueryResult,
): FfxivWorld {
  const ffxivWorld: FfxivWorld = {
    group: row.world_group,
    name: row.world_name,
    category: toServerCategory(row.world_category),
    serverStatus: toServerStatus(row.world_status),
    canCreateNewCharacters: row.can_create_new_characters,
  };

  return ffxivWorld;
}

export function asFfxivWorld(input: unknown): FfxivWorld {
  if (!isObject(input)) {
    throw new Error("input is not an object");
  }

  const ffxivWorld: FfxivWorld = {
    group: asString(input.group),
    name: asString(input.name),
    category: toServerCategory(asString(input.category)),
    serverStatus: toServerStatus(asString(input.serverStatus)),
    canCreateNewCharacters: asBoolean(input.canCreateNewCharacters),
  };

  return ffxivWorld;
}
