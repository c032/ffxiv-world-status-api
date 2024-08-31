begin;

insert into migrations (id) values (20240831040417);

create or replace view ffxiv.worldstatus_v1 as (
	select
		t.batch_id batch_id,
		t.worldstatus_timestamp worldstatus_timestamp,
		t.jsonb_world_item->>'Group' world_group,
		t.jsonb_world_item->>'Name' world_name,
		t.jsonb_world_item->>'Category' world_category,
		t.jsonb_world_item->>'ServerStatus' world_status,
		(t.jsonb_world_item->>'CanCreateNewCharacters')::boolean can_create_new_characters
	from (
		select
			id batch_id,
			worldstatus_timestamp worldstatus_timestamp,
			jsonb_array_elements(worldstatus_data->'items') jsonb_world_item
		from (
			select *
			from ffxiv.worldstatus_history
			where
				worldstatus_version = 1
				and jsonb_typeof(worldstatus_data->'items') = 'array'
			order by id asc
		)
	) t
	order by
		batch_id asc,
		world_group asc,
		world_name asc
);

refresh materialized view ffxiv.worldstatus_v1_materialized;

commit;
