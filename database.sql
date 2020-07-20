create user dailybarks@localhost;
create schema dailybarks;

grant all privileges on dailybarks.* to dailybarks@localhost;
use dailybarks;

create table contents
(
	id int not null,
	createdAt timestamp default CURRENT_TIMESTAMP not null,
	title tinytext default '제목없음' null,
	content longtext not null,
	author tinytext default '익명' not null
);

create unique index contents_id_uindex
	on contents (id);

alter table contents
	add constraint contents_pk
		primary key (id);

alter table contents
	add score int default 0 not null;

alter table contents modify id Bigint not null;
