-- Danh mục khởi tạo, lấy từ hằng số của v1 (docs/BUSINESS_SPEC.md, Phụ lục A).

insert into team (code, name, unit_name) values ('HDV', 'Đội Hướng dẫn viên', 'TTKB&ĐTTN');

insert into job_position (code, title, job_description) values
    ('HDV', 'HDV', 'Hướng dẫn bệnh nhân'),
    ('MANAGER', 'Chuyên viên', 'Quản lý HDV');

insert into site (team_id, code, name, in_allowance_exports)
select t.id, v.code, v.name, v.in_allowance_exports
from team t,
     (values ('K1', 'Nhà K1', true),
             ('CS2', 'Cơ sở 2', false)) as v (code, name, in_allowance_exports)
where t.code = 'HDV';

-- sort_order: thứ tự trên file T7-CN; evening_sort_order: thứ tự trên file Làm tối.
insert into block (team_id, name, sort_order, evening_sort_order)
select t.id, v.name, v.sort_order, v.evening_sort_order
from team t,
     (values ('Tầng 1', 1, null::int),
             ('Tầng 2', 2, 1),
             ('Tầng 3', 3, 2),
             ('Tầng 4', 4, null::int),
             ('Tầng 5', 5, 3),
             ('Tầng 6', 6, null::int),
             ('Quầy thông tin', 7, null::int),
             ('Tầng 2 nhà P', 8, null::int),
             ('Tầng B1', 9, 5),
             ('Tầng 7', 10, 4),
             ('CS2', 11, null::int)) as v (name, sort_order, evening_sort_order)
where t.code = 'HDV';

insert into location (team_id, site_id, block_id, code, name, on_weekday, on_evening, on_weekend, sort_order)
select t.id, s.id, b.id, v.code, v.name, v.on_weekday, v.on_evening, v.on_weekend, v.sort_order
from (values ('K1.1TD', 'Tầng 1', 'Tầng 1', 'K1', true, false, true, 10),
             ('K1.2TDSA', 'Siêu âm', 'Tầng 2', 'K1', true, true, true, 20),
             ('K1.2TDXQ', 'Xquang', 'Tầng 2', 'K1', true, false, true, 30),
             ('K1.3TD', 'T3', 'Tầng 3', 'K1', true, false, true, 40),
             ('K1.3TM', '3A', 'Tầng 3', 'K1', true, false, true, 50),
             ('K1.3TH', 'NSTH', 'Tầng 3', 'K1', true, false, true, 60),
             ('K1.P322', 'P322', 'Tầng 3', 'K1', true, false, true, 70),
             ('K1.P323', 'P323', 'Tầng 3', 'K1', true, false, true, 80),
             ('K1.P321', 'P321', 'Tầng 3', 'K1', false, true, false, 85),
             ('K1.4TD', 'T4', 'Tầng 4', 'K1', true, false, true, 90),
             ('K1.401406', '4A', 'Tầng 4', 'K1', true, false, true, 100),
             ('K1.407412', '4B', 'Tầng 4', 'K1', true, false, true, 110),
             ('K1.414417', '4CD', 'Tầng 4', 'K1', true, false, true, 120),
             ('K1.418423', '4CD', 'Tầng 4', 'K1', true, false, true, 130),
             ('K1.P430', 'P430', 'Tầng 4', 'K1', true, false, true, 140),
             ('K1.5TD', 'T5', 'Tầng 5', 'K1', true, false, true, 150),
             ('K1.501506', '5A', 'Tầng 5', 'K1', true, false, true, 160),
             ('K1.507512', '5B', 'Tầng 5', 'K1', true, false, true, 170),
             ('K1.514517', '5CD', 'Tầng 5', 'K1', true, false, true, 180),
             ('K1.518523', '5CD', 'Tầng 5', 'K1', true, true, true, 190),
             ('K1.P530', 'P530', 'Tầng 5', 'K1', true, false, true, 200),
             ('K1.6TD', 'T6', 'Tầng 6', 'K1', true, false, true, 210),
             ('K1.601606', '6A', 'Tầng 6', 'K1', true, false, true, 220),
             ('K1.607612', '6B', 'Tầng 6', 'K1', true, false, true, 230),
             ('K1.614617', '6CD', 'Tầng 6', 'K1', true, false, true, 240),
             ('K1.618623', '6CD', 'Tầng 6', 'K1', true, false, true, 250),
             ('K1.P630', 'P630', 'Tầng 6', 'K1', true, false, true, 260),
             ('K1.HDV1', 'Bốt 1', 'Quầy thông tin', 'K1', true, false, true, 270),
             ('K1.HDV2', 'Nhà P', 'Tầng 2 nhà P', 'K1', true, false, true, 280),
             ('K1.BTD', 'B1', 'Tầng B1', 'K1', true, true, true, 290),
             ('K1.701-706', '7C', 'Tầng 7', 'K1', true, false, true, 300),
             ('K1.707-712', '7D', 'Tầng 7', 'K1', true, true, true, 310),
             ('CS2', 'CS2', 'CS2', 'CS2', true, false, true, 320)) as v (code, name, block, site, on_weekday, on_evening, on_weekend, sort_order)
         join team t on t.code = 'HDV'
         join site s on s.team_id = t.id and s.code = v.site
         join block b on b.team_id = t.id and b.name = v.block;

-- Ca nghỉ chiều (half_day) ghi giờ kết thúc 16:30 trên file Làm sớm.
-- "2K43" nghỉ chiều thay cho mã giả "2K44" của v1. K18 / K39 (vào 7h30) không tính làm sớm.
insert into shift (team_id, site_id, code, start_time, end_time, slot, half_day, on_weekday, on_weekend,
                   early_eligible, early_end_time, sort_order)
select t.id, s.id, v.code, v.start_time, v.end_time, v.slot, v.half_day, v.on_weekday, v.on_weekend,
       v.early_eligible, v.early_end_time, v.sort_order
from (values ('K02', time '05:00', time '16:30', 'MAIN', false, true, false, true, null::time, null, 10),
             ('K04', time '05:30', time '16:30', 'MAIN', false, true, false, true, null::time, null, 20),
             ('K07', time '06:00', time '16:30', 'MAIN', false, true, false, true, null::time, null, 30),
             ('K14', time '06:30', time '18:30', 'MAIN', false, true, false, true, null::time, null, 40),
             ('K18', time '07:30', time '17:00', 'MAIN', false, true, false, false, null::time, null, 50),
             ('K01', time '05:00', time '15:30', 'MAIN', false, false, true, true, null::time, null, 110),
             ('K03', time '05:30', time '16:00', 'MAIN', false, false, true, true, null::time, null, 120),
             ('K06', time '06:00', time '16:30', 'MAIN', false, false, true, true, null::time, null, 130),
             ('K10', time '07:00', time '17:30', 'MAIN', false, false, true, true, null::time, null, 140),
             ('K09', time '06:30', time '16:30', 'MAIN', false, false, true, true, null::time, null, 150),
             ('2K43', time '06:30', time '16:30', 'MAIN', false, true, true, true, null::time, 'CS2', 200),
             ('2K04', time '05:30', time '16:30', 'MAIN', false, true, false, true, null::time, 'CS2', 210),
             ('K35', time '05:00', time '12:00', 'MAIN', true, true, false, true, time '16:30', null, 300),
             ('K36', time '05:30', time '12:00', 'MAIN', true, true, false, true, time '16:30', null, 310),
             ('K37', time '06:00', time '12:00', 'MAIN', true, true, false, true, time '16:30', null, 320),
             ('K39', time '07:30', time '12:00', 'MAIN', true, true, false, false, time '16:30', null, 330),
             ('2K43', time '06:30', time '12:00', 'MAIN', true, true, false, true, time '16:30', 'CS2', 340),
             ('2K36', time '05:30', time '12:00', 'MAIN', true, true, false, true, time '16:30', 'CS2', 350),
             ('K15', time '16:30', time '20:00', 'EVENING', false, true, false, false, null::time, null, 400)) as v (code, start_time, end_time, slot, half_day, on_weekday, on_weekend, early_eligible,
                                                       early_end_time, site, sort_order)
         join team t on t.code = 'HDV'
         left join site s on s.team_id = t.id and s.code = v.site;

insert into off_type (team_id, code, label, fast_note, is_default, sort_order)
select t.id, v.code, v.label, v.fast_note, v.is_default, v.sort_order
from team t,
     (values ('leave', 'Nghỉ', null, true, 10),
             ('sick', 'Nghỉ ốm', 'Nghỉ ốm', false, 20),
             ('business_trip', 'Công tác', 'Công tác', false, 30),
             ('maternity_leave', 'Nghỉ đẻ', 'Nghỉ đẻ', false, 40)) as v (code, label, fast_note, is_default, sort_order)
where t.code = 'HDV';
