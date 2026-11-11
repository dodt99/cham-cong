-- Nhân viên đội HDV: CORE = nhóm K1 chính của v1, SUPPORT = nhóm K2 tăng cường tối / T7-CN.
-- sort_order giữ đúng thứ tự hiển thị và thứ tự xuất file của v1.
create temporary table seed_employee (
    code text, full_name text, tax_code text, position text, membership text, sort_order int
) on commit drop;

insert into seed_employee (code, full_name, tax_code, position, membership, sort_order) values
    ('24662', 'Nguyễn Trà My', '8712601809', 'HDV', 'CORE', 10),
    ('25120', 'Phùng Thị Thu Dung', '8643231618', 'HDV', 'CORE', 20),
    ('23380', 'Trần Như Quỳnh', '8459978969', 'HDV', 'CORE', 30),
    ('24643', 'Nguyễn Phương Anh', '8712601862', 'HDV', 'CORE', 40),
    ('24676', 'Trần Phương Linh', '8571254148', 'HDV', 'CORE', 50),
    ('24666', 'Trần Bích Hà', '8712601799', 'HDV', 'CORE', 60),
    ('24675', 'Đào Yến Linh', '8614248279', 'HDV', 'CORE', 70),
    ('24678', 'An Lâm Ngọc', '8640818380', 'HDV', 'CORE', 80),
    ('24687', 'Đào Thị Hải Yến', '8532343355', 'HDV', 'CORE', 90),
    ('24665', 'Lê Hồng Dương', '8712601904', 'HDV', 'CORE', 100),
    ('23745', 'Phạm Thị Thu Trang', '8437660185', 'HDV', 'CORE', 110),
    ('29121', 'Nguyễn Thị Linh', '8615412450', 'HDV', 'CORE', 120),
    ('30070', 'Phạm Thị Thu', '8657412036', 'HDV', 'CORE', 130),
    ('24669', 'Nguyễn Thị Hương', '8682241088', 'HDV', 'CORE', 140),
    ('24677', 'Phạm Cẩm Ly', '8712601830', 'HDV', 'CORE', 150),
    ('23743', 'Đào Thị Lan Anh', '8323732196', 'HDV', 'CORE', 160),
    ('23750', 'Vũ Thị Thanh Hồng', '8511395440', 'HDV', 'CORE', 170),
    ('24667', 'Nguyễn Thị Hòa', '8023539184', 'HDV', 'CORE', 180),
    ('30062', 'Hoàng Thị Vân Anh', '8451794649', 'HDV', 'CORE', 190),
    ('24642', 'Hoàng Phương Anh', '871260781', 'HDV', 'CORE', 200),
    ('30067', 'Ngô Văn Sơn', '8650673328', 'HDV', 'CORE', 210),
    ('24660', 'Vũ Quốc Bảo', '8672370334', 'HDV', 'CORE', 220),
    ('24679', 'Nguyễn Thị Hồng Ngọc', '8510675117', 'HDV', 'CORE', 230),
    ('24680', 'Đoàn Thị Nhung', '8400971427', 'HDV', 'CORE', 240),
    ('24644', 'Nguyễn Phương Anh', '8643231625', 'HDV', 'CORE', 250),
    ('19439', 'Nguyễn Thị Bích Hằng', '8097507243', 'HDV', 'CORE', 260),
    ('19433', 'Đỗ Thị Ngọc Diệp', '8480133731', 'HDV', 'CORE', 270),
    ('19434', 'Lê Quang Trung', '8429284755', 'HDV', 'CORE', 280),
    ('23741', 'Vũ Quang Anh', '8712601887', 'HDV', 'CORE', 290),
    ('23746', 'Nguyễn Ngọc Hoàng Yến', '8439532809', 'HDV', 'CORE', 300),
    ('30063', 'Nguyễn Thị Mai Trang', '8718750395', 'HDV', 'CORE', 310),
    ('30066', 'Vương Thị Ngọc Ánh', '8614690529', 'HDV', 'CORE', 320),
    ('30064', 'Đỗ Minh Khuê', '8625569965', 'HDV', 'CORE', 330),
    ('30068', 'Nguyễn Thị Minh Hòa', '8571815717', 'HDV', 'CORE', 340),
    ('30065', 'Hoàng Thị Thủy', '8573268202', 'HDV', 'CORE', 350),
    ('23160', 'PHAN THỊ HỒNG THÚY', '8009287175', 'MANAGER', 'CORE', 360),
    ('19435', 'Ngô Thị Ánh Nguyệt', '0105209369', 'HDV', 'SUPPORT', 10),
    ('19441', 'Nguyễn Thị Hoa', '8338107607', 'HDV', 'SUPPORT', 20),
    ('19440', 'Nguyễn Thị Chuyên', '8338107597', 'HDV', 'SUPPORT', 30),
    ('19437', 'Nguyễn Hải Quyên', '8119343471', 'HDV', 'SUPPORT', 40),
    ('19431', 'Đặng Lan Phương', '8480133805', 'HDV', 'SUPPORT', 50),
    ('19169', 'Đỗ Như Thành', '8626680596', 'HDV', 'SUPPORT', 60),
    ('23420', 'Nguyễn Thị Thu Hồng', '8115110652', 'HDV', 'SUPPORT', 70),
    ('30069', 'Đặng Thị Thu Phương', '8425272170', 'HDV', 'SUPPORT', 80),
    ('19436', 'Nguyễn Diệu Hoa', '8331453125', 'HDV', 'SUPPORT', 90),
    ('23744', 'Trần Thị Hương', '8556638559', 'HDV', 'SUPPORT', 100),
    ('24686', 'Vũ Anh Văn', '8124737947', 'HDV', 'SUPPORT', 110);

insert into employee (code, full_name, tax_code, position_id)
select s.code, s.full_name, s.tax_code, p.id
from seed_employee s
         join job_position p on p.code = s.position;

insert into team_member (team_id, employee_id, membership, sort_order)
select t.id, e.id, s.membership, s.sort_order
from seed_employee s
         join employee e on e.code = s.code
         join team t on t.code = 'HDV';
