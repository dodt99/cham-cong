-- Đội / đơn vị. V2 chỉ có 1 đội HDV; mọi bảng nghiệp vụ mang team_id để thêm đội sau.
create table team (
    id        bigint generated always as identity primary key,
    code      text not null unique,
    name      text not null,
    unit_name text not null                      -- tên đơn vị in trên file thanh toán
);

create table app_user (
    id            bigint generated always as identity primary key,
    username      text not null unique,
    password_hash text not null,
    full_name     text not null,
    role          text not null check (role in ('ADMIN', 'EDITOR', 'VIEWER')),
    active        boolean not null default true,
    created_at    timestamptz not null default now()
);

-- Chức danh: quyết định cột "Chức danh" và "Công việc" trên file Làm sớm.
create table job_position (
    id              bigint generated always as identity primary key,
    code            text not null unique,
    title           text not null,
    job_description text not null
);

create table employee (
    id          bigint generated always as identity primary key,
    code        text not null unique,            -- mã NV
    full_name   text not null,
    tax_code    text not null,                   -- MST, giữ số 0 đầu
    position_id bigint not null references job_position (id)
);

create table team_member (
    id          bigint generated always as identity primary key,
    team_id     bigint not null references team (id),
    employee_id bigint not null references employee (id),
    membership  text not null check (membership in ('CORE', 'SUPPORT')),   -- CORE = đội chính, SUPPORT = tăng cường tối / T7-CN
    sort_order  int not null,
    active_from date,
    active_to   date,
    unique (team_id, employee_id)
);

-- Cơ sở làm việc. in_allowance_exports = false: không lên file Làm sớm và T7-CN.
create table site (
    id                   bigint generated always as identity primary key,
    team_id              bigint not null references team (id),
    code                 text not null,
    name                 text not null,
    in_allowance_exports boolean not null default true,
    unique (team_id, code)
);

-- Block (tầng / khu) in trên file thanh toán; hai cột thứ tự vì file Tối và T7-CN xếp khác nhau.
create table block (
    id                 bigint generated always as identity primary key,
    team_id            bigint not null references team (id),
    name               text not null,
    sort_order         int not null,
    evening_sort_order int,
    unique (team_id, name)
);

create table location (
    id         bigint generated always as identity primary key,
    team_id    bigint not null references team (id),
    site_id    bigint not null references site (id),
    block_id   bigint not null references block (id),
    code       text not null,                    -- mã địa điểm dùng cho Fast
    name       text not null,
    on_weekday boolean not null default true,
    on_evening boolean not null default false,
    on_weekend boolean not null default true,
    sort_order int not null,
    active     boolean not null default true,
    unique (team_id, code)
);

create table shift (
    id             bigint generated always as identity primary key,
    team_id        bigint not null references team (id),
    site_id        bigint references site (id),  -- ca chỉ dùng ở một cơ sở (2Kxx → CS2); null = không giới hạn
    code           text not null,
    start_time     time not null,
    end_time       time not null,
    slot           text not null check (slot in ('MAIN', 'EVENING')),
    half_day       boolean not null default false,          -- nghỉ chiều
    on_weekday     boolean not null default false,
    on_weekend     boolean not null default false,
    early_eligible boolean not null default true,           -- có lên file Làm sớm không
    early_end_time time,                                    -- giờ kết thúc ghi trên file Làm sớm nếu khác end_time
    sort_order     int not null,
    active         boolean not null default true,
    unique (team_id, code, half_day)             -- "2K43" có 2 dòng: cả ngày và nghỉ chiều
);

create table off_type (
    id         bigint generated always as identity primary key,
    team_id    bigint not null references team (id),
    code       text not null,
    label      text not null,
    fast_note  text,                             -- ghi chú trên file Fast
    is_default boolean not null default false,
    sort_order int not null,
    unique (team_id, code)
);

-- Một dòng = một phân công: nhân viên × ngày × khe (MAIN = ca chính, EVENING = ca tối).
-- Ngày không có dòng MAIN = chưa xếp = xuất ra như "Nghỉ".
create table assignment (
    id          bigint generated always as identity primary key,
    team_id     bigint not null references team (id),
    employee_id bigint not null references employee (id),
    work_date   date not null,
    slot        text not null check (slot in ('MAIN', 'EVENING')),
    shift_id    bigint references shift (id),
    off_type_id bigint references off_type (id),
    location_id bigint references location (id),
    version     int not null default 0,
    updated_at  timestamptz not null default now(),
    updated_by  bigint references app_user (id),
    unique (team_id, employee_id, work_date, slot),
    constraint assignment_slot_content check (
        (slot = 'MAIN' and (shift_id is null) <> (off_type_id is null))
        or (slot = 'EVENING' and shift_id is not null and off_type_id is null)
    ),
    constraint assignment_off_has_no_location check (off_type_id is null or location_id is null)
);

create index assignment_team_date_idx on assignment (team_id, work_date);

-- Spring Session JDBC (phiên đăng nhập).
create table spring_session (
    primary_id            char(36) not null,
    session_id            char(36) not null,
    creation_time         bigint not null,
    last_access_time      bigint not null,
    max_inactive_interval int not null,
    expiry_time           bigint not null,
    principal_name        varchar(100),
    constraint spring_session_pk primary key (primary_id)
);

create unique index spring_session_ix1 on spring_session (session_id);
create index spring_session_ix2 on spring_session (expiry_time);
create index spring_session_ix3 on spring_session (principal_name);

create table spring_session_attributes (
    session_primary_id char(36) not null,
    attribute_name     varchar(200) not null,
    attribute_bytes    bytea not null,
    constraint spring_session_attributes_pk primary key (session_primary_id, attribute_name),
    constraint spring_session_attributes_fk foreign key (session_primary_id) references spring_session (primary_id) on delete cascade
);
