begin;

create table migrations (
	id
		bigint
		primary key,

	created_at
		timestamp with time zone
		not null
		default current_timestamp
);

insert into migrations (id) values (20240219143535);

commit;
