# Thiết kế v2 — Chấm công HDV

> Nghiệp vụ chi tiết của v1 (quy tắc nhập liệu, từng ô của 4 file Excel, golden test, danh mục seed) nằm ở
> [`BUSINESS_SPEC.md`](./BUSINESS_SPEC.md). Tài liệu này chỉ mô tả **v2 được dựng thế nào** và ghi đè các đề xuất
> kỹ thuật ở mục 11 của spec (vốn viết cho Firestore).

## 1. Các quyết định đã chốt

| Chủ đề | Quyết định |
|--------|-----------|
| Công nghệ | Spring Boot (backend) · Next.js (frontend) · PostgreSQL |
| Phạm vi | 1 đội HDV; cấu trúc dữ liệu có sẵn khoá `team` để thêm đội sau |
| Người dùng | Chỉ quản lý đăng nhập bằng tài khoản + mật khẩu do admin tạo. Nhân viên HDV không dùng app |
| Dữ liệu cũ | Không chuyển các tuần cũ từ Firestore. Chỉ seed danh mục, bắt đầu từ tuần đầu tiên dùng v2 |
| Sửa đồng thời | Thường 1 người sửa. Lưu từng ô, phát hiện xung đột, không cần real-time |
| Repo | Monorepo trong repo này: `backend/` + `frontend/`; v1 giữ ở tag `v1` |
| Excel | **Giống v1 tuyệt đối**, kể cả các chỗ đã biết: tiêu đề Làm sớm khi tuần vắt tháng, cột Tên đơn vị (O) và STT để trống |
| Template Excel | Xoá các sheet thừa chứa dữ liệu tuần cũ, chỉ giữ sheet được điền. Đây là khác biệt duy nhất so với file v1 |
| Cột "Mặc định" | Bỏ khỏi dữ liệu. Thay bằng thao tác "Áp cho cả tuần" (T2→T6), có hỏi ghi đè hay chỉ điền ngày trống |
| Nhóm K2 | Là người đội khác đến tăng cường: chỉ ghi nhận ca tối và T7-CN, giữ như v1 |
| Mã ca tiền tố `2` | Là ca của cơ sở 2 (CS2), chỉ dùng ở CS2 |
| Mã `2K44` | Bỏ. Đó là mã giả v1 đặt ra để phân biệt "2K43 nghỉ chiều"; v2 dùng đúng mã `2K43` (mục 3.4) |
| Nhân viên vào / nghỉ giữa tuần | Người có thời gian hiệu lực giao với tuần thì xuất hiện trong tuần đó; ngày ngoài khoảng coi như trống |
| MST nhân viên | Seed thẳng trong migration của repo |
| Khoá tuần / lịch sử sửa | Không làm |
| Mở rộng cần chừa chỗ | Báo cáo tháng |
| Triển khai | Chưa quyết nơi đặt → đóng gói Docker Compose, chạy được ở đâu cũng được |

**Không nằm trong v2:** migrate Firestore, real-time, khoá/duyệt tuần, audit log, nhập Face ID, tài khoản nhân viên,
sao chép tuần, xin nghỉ/đổi ca. Thiết kế dưới đây không cản việc thêm các mục này về sau, nhưng không dựng sẵn gì cho chúng.

## 2. Ý tưởng cốt lõi: phân công theo ngày

V1 lưu "bảng tuần" — một cục JSON `tuần → nhân viên → 7 ngày`, trong đó ca tối là một cờ gắn vào ngày và cột
Mặc định là dữ liệu nằm lẫn với thao tác. Mọi sự chắp vá đều bắt nguồn từ đó.

V2 lưu **một dòng cho mỗi phân công**:

> nhân viên × ngày × **khe** (`MAIN` = ca chính trong ngày, `EVENING` = ca tối tăng cường) → ca **hoặc** loại nghỉ, kèm địa điểm

- **"Tuần" không còn là dữ liệu**, chỉ là khoảng ngày T2→CN dùng để hiển thị và xuất file. Không cần "tạo bảng":
  mở tuần nào cũng được, tuần chưa nhập thì trống.
- **Ca tối là một phân công bình thường** ở khe `EVENING`, không phải cờ boolean.
- **Ngày không có dòng `MAIN`** = chưa xếp = xuất ra như `Nghỉ` (đúng quy ước "ngày trống = nghỉ" của v1).
- **Báo cáo tháng** chỉ là câu `GROUP BY` trên chính bảng này theo khoảng ngày của tháng.
- Thêm loại phân công mới sau này (trực, đào tạo…) = thêm một giá trị khe, không đổi cấu trúc.

## 3. Mô hình dữ liệu (PostgreSQL)

```
team ──┬── team_member ── employee ── position
       ├── site ──┬── location ── block
       │          └── shift
       ├── off_type
       └── assignment (employee, work_date, slot) → shift | off_type, location
app_user
```

### 3.1 Danh mục

```sql
team        (id, code, name, unit_name)                 -- unit_name = 'TTKB&ĐTTN'
app_user    (id, username UNIQUE, password_hash, full_name, role, active)   -- role: ADMIN | EDITOR | VIEWER

position    (id, code, title, job_description)
            -- HDV: 'HDV' / 'Hướng dẫn bệnh nhân' ; MANAGER: 'Chuyên viên' / 'Quản lý HDV'

employee    (id, code UNIQUE, full_name, tax_code, position_id)
            -- code = mã NV ('24662'); tax_code là chuỗi, giữ số 0 đầu

team_member (id, team_id, employee_id, membership, sort_order, active_from, active_to,
             UNIQUE (team_id, employee_id))
            -- membership: CORE (v1: K1 chính) | SUPPORT (v1: K2 tăng cường)

site        (id, team_id, code, name, in_allowance_exports)
            -- K1 (true), CS2 (false: không lên file Làm sớm và T7-CN)

block       (id, team_id, name, sort_order, evening_sort_order)
            -- 'Tầng 1'…'Tầng 7', 'Quầy thông tin', 'Tầng 2 nhà P', 'Tầng B1', 'CS2'

location    (id, team_id, site_id, block_id, code, name,
             on_weekday, on_evening, on_weekend, sort_order, active,
             UNIQUE (team_id, code))

shift       (id, team_id, site_id NULL, code, start_time, end_time,
             slot, half_day, on_weekday, on_weekend,
             early_eligible, early_end_time NULL,
             sort_order, active,
             UNIQUE (team_id, code, half_day))

off_type    (id, team_id, code, label, fast_note NULL, is_default, sort_order)
```

### 3.2 Phân công

```sql
assignment (
  id, team_id, employee_id, work_date DATE, slot,          -- slot: MAIN | EVENING
  shift_id NULL, off_type_id NULL, location_id NULL,
  version INT, updated_at, updated_by,
  UNIQUE (team_id, employee_id, work_date, slot),
  CHECK ( (slot = 'MAIN'    AND (shift_id IS NULL) <> (off_type_id IS NULL))   -- đúng 1 trong 2: ca hoặc nghỉ
       OR (slot = 'EVENING' AND shift_id IS NOT NULL AND off_type_id IS NULL) ),
  CHECK ( off_type_id IS NULL OR location_id IS NULL )                         -- nghỉ thì không có địa điểm
)
INDEX (team_id, work_date)
```

Các bất biến của v1 (mục 4 spec) giờ do database giữ, không còn phụ thuộc code giao diện.
`version` dùng cho khoá lạc quan (mục 5.2).

### 3.3 Mỗi hằng số hard-code của v1 đi về đâu

| V1 (hard-code) | V2 |
|----------------|----|
| 3 bộ địa điểm NORMAL / EVENING / WEEKEND (NORMAL và WEEKEND giống hệt) | 1 bảng `location` + 3 cờ `on_weekday / on_evening / on_weekend`. `K1.P321` chỉ bật `on_evening` |
| Thứ tự block suy ra từ thứ tự khai báo | `block.sort_order` (T7-CN) và `block.evening_sort_order` (file Tối) |
| 4 nhóm ca theo nhãn chuỗi | `shift.slot` + `half_day` + `on_weekday` + `on_weekend`. `2K43` bật cả hai cờ ngày thay vì khai 2 lần |
| Mã giả `2K44`, đổi lại thành `2K43` khi xuất Fast | Không còn `2K44`. Có 2 dòng ca cùng mã `2K43`: cả ngày và nghỉ chiều (mục 3.4) |
| Bỏ `K18`, `K39` khỏi Làm sớm | `shift.early_eligible = false` |
| Ca Nghỉ chiều tính kết thúc 16:30 trên file Làm sớm | `shift.early_end_time = 16:30` trên 6 ca nghỉ chiều |
| Ghi chú `Nghỉ chiều` | `shift.half_day = true` |
| Bỏ `NORMAL-CS2`, `WEEKEND-CS2` khỏi Làm sớm / T7-CN | `site.in_allowance_exports = false` cho site CS2 |
| Mã ca tiền tố `2` | `shift.site_id = CS2`; cảnh báo khi đi với địa điểm ngoài CS2 |
| Quản lý `23160` → `Chuyên viên` / `Quản lý HDV` | `employee.position_id = MANAGER` |
| `EMPLOYEES` / `EMPLOYEES_K2` | `team_member.membership` = `CORE` / `SUPPORT` |
| Comment-out nhân viên nghỉ việc | `team_member.active_to`; tuần cũ vẫn còn người đó |
| `TTKB&ĐTTN` | `team.unit_name` |
| `extraEvening` + `eveningLocationKey` | dòng `assignment` khe `EVENING` |
| `defaultShiftCode / defaultOffType / defaultLocationKey` | bỏ; là thao tác hàng loạt (mục 5.3) |

Những thứ **gắn với khuôn file** (dòng bắt đầu, số cột, tên sheet, `K006`, nhãn `Nghỉ`, màu `FFCFE2F3`,
chức danh/công việc cố định của file Tối và T7-CN) ở lại trong code, nằm cạnh template tương ứng — chúng đổi cùng lúc
với template chứ không phải danh mục người dùng sửa.

### 3.4 Ca `2K43` nghỉ chiều

V1 chọn ca bằng mã, nên "2K43 làm buổi sáng" phải mang một mã khác (`2K44`) rồi đổi ngược lại thành `2K43` lúc xuất Fast.
V2 định danh ca bằng `id`, mã ca chỉ là thuộc tính, nên danh mục có hai dòng cùng mã:

| code | Giờ | half_day | Hiển thị khi chọn |
|------|-----|----------|-------------------|
| `2K43` | 6h30–16h30 | false | `2K43` 6h30–16h30 |
| `2K43` | 6h30–12h00 | true | `2K43` 6h30–12h00 · Nghỉ chiều |

Mã hiển thị, mã lưu và mã xuất Fast đều là `2K43`; không còn phép đổi mã nào trong code export.
Ràng buộc duy nhất là `(team_id, code, half_day)`. Các ca nghỉ chiều còn lại (`K35`, `K36`, `K37`, `K39`, `2K36`) giữ mã riêng như v1.

Hệ quả cần giữ đúng: file Fast gộp các ngày liên tiếp theo **ca (`id`)** chứ không theo mã, để "2K43 cả ngày" và
"2K43 nghỉ chiều" vẫn tách thành 2 dòng như v1 (dòng sau có ghi chú `Nghỉ chiều`).

## 4. Xuất Excel

Chạy **phía backend** bằng Apache POI, điền vào 4 file template của v1 (`public/templates/*-empty.xlsx`) sau khi đã
**xoá sheet thừa**: file Làm tối chỉ giữ `Sheet1` (bỏ 11 sheet dữ liệu tuần cũ), file T7-CN chỉ giữ `T7` và `CN` (bỏ `10.5`).
Template nằm trong tài nguyên của backend, không còn là file tĩnh ai cũng tải được như ở v1.

```
WeekScheduleReader      đọc 1 lần: roster + assignment 7 ngày + danh mục  →  WeekSchedule (bất biến)
        │
        ├─ FastRowBuilder      ┐
        ├─ EarlyRowBuilder     │  hàm thuần: WeekSchedule → List<Row>   (toàn bộ quy tắc mục 7 spec nằm ở đây)
        ├─ EveningRowBuilder   │
        └─ WeekendRowBuilder   ┘
                │
        ┌───────┴────────┐
   preview (JSON)    TemplateWriter (POI) → .xlsx
```

- Xem trước và file tải về dùng **chung một danh sách dòng**, nên không thể lệch nhau. Frontend chỉ còn 1 bảng preview
  và 1 nút xuất dùng chung cho cả 4 loại (v1 có 4 bản sao của mỗi thứ).
- Thêm loại file mới về sau = thêm 1 builder + 1 template + 1 bảng ánh xạ cột.
- Roster: Fast và Làm sớm lấy `CORE`; Tối và T7-CN lấy `CORE` rồi `SUPPORT`, mỗi nhóm theo `sort_order`.

### Bảo đảm "giống v1 tuyệt đối"

Trước khi viết backend, chạy **code v1 trên bộ template đã làm sạch** để sinh bộ file `.xlsx` chuẩn cho các kịch bản
TC-1, TC-2, TC-3 của spec (chỗ v1 chọn `2K44` thì v2 chọn `2K43` nghỉ chiều), cộng thêm: ca `K14`, tuần vắt tháng (2026-04-27), ca tối/ca T7 không có địa điểm. Các file này commit vào
`backend/src/test/resources/golden/`.

Test của v2 nạp cùng kịch bản, xuất file, rồi so **từng ô trên mọi sheet** với file chuẩn: giá trị, kiểu dữ liệu
(chuỗi / số / ngày), number format, màu nền. Build đỏ nếu lệch một ô. "Giống" ở đây là giống nội dung và định dạng
từng ô; hai file không trùng từng byte vì thư viện ghi khác nhau.

Các điểm cố ý giữ theo v1: tiêu đề Làm sớm `NGÀY 27-01/5/2026` khi vắt tháng, cột O và STT để trống,
file Tối xếp `Tầng 7` trước `Tầng B1` còn file T7-CN xếp ngược lại, quản lý chỉ có chức danh riêng trên file Làm sớm.

## 5. Backend (Spring Boot)

Modular monolith, chia package theo nghiệp vụ; mỗi module chỉ lộ service + DTO, không lộ entity:

```
backend/src/main/java/.../
  auth/       đăng nhập, người dùng, phân quyền
  catalog/    nhân viên, thành viên đội, ca, địa điểm, block, site, loại nghỉ, chức danh
  schedule/   assignment: quy tắc nhập liệu, lưu từng ô, thao tác hàng loạt
  export/     WeekSchedule, 4 row builder, TemplateWriter
  report/     (sau) báo cáo tháng
  common/     tuần/ngày, lỗi, cấu hình
backend/src/main/resources/
  db/migration/        Flyway: schema + seed danh mục
  excel-templates/     4 file template
```

- Spring Data JPA + **Flyway**: schema và seed toàn bộ danh mục, gồm cả nhân viên kèm MST (lấy từ Phụ lục A của spec).
- Test: JUnit + Testcontainers (Postgres thật), golden test cho export.
- springdoc-openapi sinh mô tả API → frontend sinh kiểu TypeScript từ đó, không khai báo tay hai lần.
- Phiên bản Java / Spring Boot: lấy bản LTS / ổn định mới nhất tại lúc khởi tạo dự án.

### 5.1 Đăng nhập và phân quyền

Spring Security, **phiên bằng cookie HTTP-only** lưu trong Postgres (Spring Session JDBC) + CSRF. Frontend và API
cùng origin sau reverse proxy nên không cần JWT hay CORS.

| Vai trò | Quyền |
|---------|-------|
| `ADMIN` | mọi thứ + danh mục + người dùng |
| `EDITOR` | xếp ca, xuất file |
| `VIEWER` | xem, xuất file |

Tài khoản admin đầu tiên tạo từ biến môi trường khi khởi động lần đầu. Mật khẩu băm bằng BCrypt/Argon2.

### 5.2 API chính

```
POST   /api/auth/login · POST /api/auth/logout · GET /api/auth/me

GET    /api/schedule?weekStart=2026-05-04      → roster + mọi assignment của 7 ngày
PUT    /api/assignments                        → ghi 1 ô {employeeId, date, slot, shiftId | offTypeId, locationId, version}
DELETE /api/assignments                        → xoá 1 ô {employeeId, date, slot, version}
POST   /api/assignments/bulk                   → "Áp cho cả tuần" (1 transaction)

GET    /api/exports/{fast|early|evening|weekend}/preview?weekStart=…
GET    /api/exports/{fast|early|evening|weekend}/file?weekStart=…

GET|POST|PUT /api/catalog/{employees|members|shifts|locations|blocks|sites|off-types|positions}   (ghi: ADMIN)
GET|POST|PUT /api/users                                                                            (ADMIN)
GET    /api/reports/monthly?month=2026-05      (sau)
```

**Lưu từng ô:** mỗi lần ghi gửi kèm `version` đang thấy. Nếu ô đã bị người khác đổi, server trả `409` kèm giá trị
hiện tại; giao diện nạp lại ô đó và báo cho người dùng thay vì âm thầm đè lên.

Service luôn nhận `teamId` (hiện lấy từ đội mặc định). Khi có đội thứ hai chỉ cần thêm cách chọn đội, không sửa tầng dưới.

### 5.3 Quy tắc nhập liệu (giữ theo mục 5 spec, trừ chỗ ghi rõ)

- Ô ngày thường: ca `MAIN` có `on_weekday` (ca thường + nghỉ chiều) hoặc 1 trong các loại nghỉ.
  Ô T7/CN: ca có `on_weekend` hoặc "Nghỉ". Đổi ca giữ địa điểm; chọn nghỉ xoá địa điểm.
- Ca tối: chọn nhân viên chưa có ca tối hôm đó + địa điểm `on_evening`; ca là ca `EVENING` duy nhất (`K15`).
- **Áp cho cả tuần** (thay cột Mặc định): chọn ca/nghỉ + địa điểm cho T2→T6. Nếu có ngày đã nhập khác đi,
  hỏi *ghi đè tất cả* hay *chỉ điền ngày còn trống*. Không đụng T7/CN và ca tối.
- Mới: cảnh báo (không chặn) khi ca thuộc CS2 (`2Kxx`) đi với địa điểm ngoài CS2; có ca nhưng thiếu địa điểm.

## 6. Frontend (Next.js)

Chuyển code v1 vào `frontend/` và giữ lại phần giao diện đã ổn: lưới nhập, combobox ca/địa điểm có tìm kiếm,
thẻ mobile, màu theo ngày. Thay toàn bộ phần dưới:

| V1 | V2 |
|----|----|
| Zustand `persist` + Firestore, ghi đè cả kho | **TanStack Query**: đọc theo tuần, ghi từng ô có optimistic update và trạng thái lưu |
| Tuần đang mở lưu chung trên server | Tuần nằm trên URL `/weeks/2026-05-04`; điều hướng tuần trước / sau / chọn ngày bất kỳ |
| Danh mục là hằng số TypeScript | Nạp từ API; màn hình quản trị danh mục cho admin |
| ExcelJS + 4 bộ build/fill/preview/nút | 1 bảng preview + 1 nút tải dùng chung, dữ liệu từ `/api/exports` |
| Không đăng nhập | Trang `/login`, chặn theo vai trò |
| Tìm kiếm không khớp chữ `đ` | Sửa (`dao` khớp "Đào") |

Trang: `/login` · `/weeks/[weekStart]` (tab Ngày thường / Tối / T7-CN / Export) · `/catalog/*` · `/users`.

Next.js chạy dạng server (không còn `output: "export"`) để dùng route động theo tuần. `AGENTS.md` yêu cầu đọc
`node_modules/next/dist/docs/` trước khi viết code vì bản Next này có thay đổi so với tài liệu cũ — áp dụng khi triển khai.

## 7. Triển khai

`docker-compose.yml` ở gốc repo: `postgres` · `backend` · `frontend` · reverse proxy (HTTPS; `/api/*` → backend,
còn lại → frontend). Chạy được trên VPS, máy chủ nội bộ hay dịch vụ cloud có hỗ trợ container. Cấu hình bí mật qua
biến môi trường. Cần kèm lịch `pg_dump` hằng ngày vì dữ liệu không còn nằm trên Firebase.

## 8. Lộ trình

| Giai đoạn | Nội dung | Xong khi |
|-----------|----------|----------|
| 0 | Gắn tag `v1`; làm sạch template; sinh bộ file golden từ code v1 | Có file chuẩn cho mọi kịch bản mục 4 |
| 1 | Khung `backend/`, Flyway schema + seed danh mục, đăng nhập | Đăng nhập được, API danh mục trả đúng seed |
| 2 | Module `schedule`: ghi từng ô, hàng loạt, quy tắc nhập liệu | Test quy tắc mục 5 spec pass |
| 3 | Module `export` | Golden test 4 file pass từng ô |
| 4 | `frontend/`: đăng nhập, lưới 3 tab, preview + tải file | Nhập và xuất trọn 1 tuần trên máy tính và điện thoại |
| 5 | Quản trị danh mục + người dùng | Thêm ca / nhân viên không cần sửa code |
| 6 | Docker Compose, backup, chuyển sang dùng thật | v1 ngừng nhận dữ liệu mới |
| Sau | Báo cáo tháng | — |
