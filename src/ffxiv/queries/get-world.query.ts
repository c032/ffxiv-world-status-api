import { sql } from "@pgtyped/runtime";

export interface GetWorldQueryParams {
  groupName: string;
  worldName: string;
}

export interface GetWorldQueryResult {
  batch_id: number;
  worldstatus_timestamp: Date;
  world_group: string;
  world_name: string;
  world_category: string;
  world_status: string;
  can_create_new_characters: boolean;
}

export const getWorldQuery = sql<{
  params: GetWorldQueryParams;
  result: GetWorldQueryResult;
}>`
  select
    batch_id,
    worldstatus_timestamp,
    world_group,
    world_name,
    world_category,
    world_status,
    can_create_new_characters
  from ffxiv.worldstatus_v1_materialized
  where
    batch_id = (
      select max(batch_id)
      from ffxiv.worldstatus_v1_materialized
    )
    and lower(world_group) = lower($groupName)
    and lower(world_name) = lower($worldName)
  ;
`;
