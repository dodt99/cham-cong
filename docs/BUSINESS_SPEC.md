# Đặc tả nghiệp vụ — Ứng dụng "Chấm công HDV" (v1 → v2)

> **Tài liệu này dùng để làm gì?**
> Đây là bản mô tả nghiệp vụ đầy đủ của ứng dụng chấm công v1 (repo `cham-cong`), viết sao cho có thể
> **copy sang một repo khác** và giao cho Claude (hoặc lập trình viên) **xây lại thành v2** mà không cần đọc code v1.
> Mọi quy tắc nghiệp vụ, dữ liệu danh mục, định dạng file Excel đầu ra và các lỗi đã biết đều nằm ở đây.

---

## 0. Hướng dẫn cho Claude khi đọc tài liệu này (ở repo v2)

1. **Đọc hết tài liệu trước khi viết code.** Các mục được đánh dấu:
   - **[GIỮ]** — quy tắc nghiệp vụ v1 phải giữ nguyên trong v2 (đầu ra Excel phải giống từng ô).
   - **[LỖI-V1]** — hành vi v1 là lỗi/hạn chế, v2 phải sửa.
   - **[V2]** — yêu cầu mới/cải tiến cho v2.
   - **[HỎI]** — điểm chưa rõ, phải hỏi người dùng trước khi tự quyết.
2. **Không đoán thêm nghiệp vụ.** Nếu một quy tắc không có trong tài liệu, hỏi người dùng.
3. **Logic nghiệp vụ phải là hàm thuần (pure function)**, tách khỏi UI và tầng lưu trữ, và có unit test.
   Bộ test bắt buộc nằm ở **mục 12 (Golden test cases)** — v2 phải pass toàn bộ.
4. **Danh mục (nhân viên, ca, địa điểm, loại nghỉ, quy tắc export)** không được hard-code trong v2;
   dùng dữ liệu ở **Phụ lục A** làm *seed data* ban đầu.
5. Các file Excel mẫu (template) cần được copy kèm từ repo v1: `public/templates/*-empty.xlsx`
   (xem mục 7.0 về việc làm sạch template trước khi copy).
6. Làm theo thứ tự đề xuất ở **mục 11.6 (Lộ trình triển khai)**; sau mỗi giai đoạn chạy test.
7. Gợi ý: trong repo v2, thêm dòng `@docs/BUSINESS_SPEC.md` vào `CLAUDE.md` để tài liệu luôn được nạp vào ngữ cảnh.

---

## 1. Bối cảnh nghiệp vụ

- **Đơn vị sử dụng:** Bệnh viện Bạch Mai — Khoa Khám chữa bệnh theo yêu cầu, đơn vị
  **TTKB&ĐTTN** (tên đơn vị in trên file Excel). Khu làm việc chính: **nhà K1** (các tầng B1, 1–7, quầy thông tin,
  nhà P) và **CS2** (cơ sở 2).
- **Đối tượng được chấm công:** đội **HDV — Hướng dẫn viên** (hướng dẫn bệnh nhân, HDNB = hướng dẫn người bệnh),
  cùng 1 quản lý HDV.
- **Người dùng ứng dụng:** quản lý/thư ký của đội (1 vài người), dùng trên cả máy tính và điện thoại.
- **Bài toán:** mỗi tuần, quản lý **xếp ca + địa điểm làm việc** cho từng nhân viên theo từng ngày (T2→CN),
  phân công **ca tối tăng cường** (16h30–20h00), rồi **xuất 4 file Excel** nộp cho các bộ phận:

| # | File xuất | Mục đích | Phạm vi ngày | Nhân viên |
|---|-----------|----------|--------------|-----------|
| 1 | **Fast** (`Ca-lam-viec-<tuần>.xlsx`) | Đăng ký ca làm việc hằng ngày vào phần mềm nhân sự **Fast** | T2→CN | Nhóm K1 chính |
| 2 | **Làm sớm** (`Lam-som-<tuần>.xlsx`) | Thanh toán tiền **đi làm sớm** (ca bắt đầu trước giờ hành chính) | T2→T6 | Nhóm K1 chính |
| 3 | **Làm tối** (`Lam-toi-<tuần>.xlsx`) | Thanh toán **làm ngoài giờ buổi tối** (ca K15) | T2→T6 | K1 chính + K2 |
| 4 | **T7-CN** (`T7-CN-<tuần>.xlsx`) | Thanh toán **khám chữa bệnh thứ 7, chủ nhật** | T7, CN | K1 chính + K2 |

> Cột "Giờ vào/Giờ ra (Face ID)" và "số giờ làm sớm" trên các file thanh toán **không do ứng dụng điền**
> (được điền sau, thủ công hoặc từ máy chấm công). **[V2]** có thể bổ sung — xem mục 11.4.

---

## 2. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| **Tuần / bảng chấm công (WeekSheet)** | Đơn vị dữ liệu chính. Tuần bắt đầu **thứ Hai**, định danh bằng ngày thứ Hai dạng `YYYY-MM-DD` (`weekStart`). |
| **Ngày (DayKey)** | `mon tue wed thu fri sat sun` ↔ nhãn `T2 T3 T4 T5 T6 T7 CN`. |
| **Ngày thường** | T2→T6. **Cuối tuần**: T7, CN. |
| **Ca (Shift)** | Mã ca (VD `K07`) + khung giờ được phân công (VD 6h00–16h30). |
| **Ca thường** | Ca ngày thường cả ngày. |
| **Nghỉ chiều** | Ca chỉ làm buổi sáng (đến 12h00). |
| **Ca T7-CN** | Ca dùng cho thứ 7, chủ nhật. |
| **Ca tối (K15)** | Ca tăng cường 16h30–20h00, **làm thêm** ngoài ca chính của ngày. |
| **Nghỉ / loại nghỉ (OffType)** | Ngày không có ca: Nghỉ (phép thường), Nghỉ ốm, Công tác, Nghỉ đẻ. |
| **Địa điểm (WorkLocation)** | Vị trí làm việc có **mã** (dùng cho Fast, VD `K1.1TD`), **tên ngắn** (VD `Tầng 1`, `5CD`) và **block** (tầng/khu, dùng cho file thanh toán, VD `Tầng 5`). |
| **Bộ địa điểm** | Có 3 bộ riêng: NORMAL (ngày thường), EVENING (ca tối), WEEKEND (T7-CN). |
| **Cột "Mặc định"** | Ca + địa điểm mặc định của nhân viên trong tuần, chọn 1 lần áp cho T2→T6. |
| **Nhóm K1 chính / K2** | Hai danh sách nhân viên (xem Phụ lục A.1). K2 chỉ tham gia ca tối và T7-CN. |
| **MST** | Mã số thuế cá nhân của nhân viên (in trên file thanh toán). |
| **Fast** | Phần mềm nhân sự nhận file đăng ký ca. |
| **Mã công việc** | Luôn là `K006` trên file Fast cho mọi dòng có làm việc. |

---

## 3. Danh mục (master data) — tóm tắt

Chi tiết đầy đủ ở **Phụ lục A**. Ở v1 tất cả đều hard-code trong code.

### 3.1 Nhân viên
- Thuộc tính: `id` (mã NV, chuỗi số, duy nhất), `fullName`, `taxCode` (MST, chuỗi — **giữ số 0 đầu**).
- 2 nhóm:
  - **K1 chính** (`EMPLOYEES`, 36 người): xuất hiện ở tab Ngày thường, export Fast, export Làm sớm.
  - **K2** (`EMPLOYEES_K2`, 11 người): chỉ xuất hiện ở tab Tối, tab T7-CN và 2 export tương ứng.
  - Danh sách **Tối + T7-CN** = K1 chính **nối tiếp** K2 (thứ tự này là thứ tự hiển thị/xuất).
- Nhân viên nghỉ việc ở v1 được **comment-out** khỏi danh sách (mất khỏi mọi tuần, kể cả tuần cũ). **[LỖI-V1]**
- Có nhân viên **trùng tên** (2 người "Nguyễn Phương Anh": 24643 và 24644) → luôn định danh bằng `id`.
- **Quản lý HDV**: nhân viên `23160` (PHAN THỊ HỒNG THÚY) — có chức danh khác trên file Làm sớm.

### 3.2 Ca làm việc
4 nhóm ca (thứ tự nhóm và thứ tự ca trong nhóm là thứ tự hiển thị):

| Nhóm | Mã ca → khung giờ |
|------|-------------------|
| Ca thường | K02 5h00–16h30 · K04 5h30–16h30 · K07 6h00–16h30 · K14 6h30–18h30 · K18 7h30–17h00 · 2K43 6h30–16h30 · 2K04 5h30–16h30 |
| Ca tối | K15 16h30–20h00 |
| Ca T7-CN | K01 5h00–15h30 · K03 5h30–16h00 · K06 6h00–16h30 · K10 7h00–17h30 · K09 6h30–16h30 · 2K43 6h30–16h30 |
| Nghỉ chiều | K35 5h00–12h00 · K36 5h30–12h00 · K37 6h00–12h00 · K39 7h30–12h00 · 2K44 6h30–12h00 · 2K36 5h30–12h00 |

- Mã `2K43` có mặt ở **cả** "Ca thường" và "Ca T7-CN" (cùng khung giờ). Tra cứu theo mã trả về bản ghi đầu tiên (Ca thường) — không ảnh hưởng vì giờ giống nhau.
- Mã có tiền tố `2` (2K43, 2K04, 2K44, 2K36) — **[HỎI]** ý nghĩa (có thể là ca CS2/ca nhóm 2); v1 không xử lý gì đặc biệt ngoài quy tắc `2K44 → 2K43` ở file Fast.
- Ca được phép chọn theo ngữ cảnh:
  - Cột **Mặc định**: chỉ nhóm "Ca thường" (+ các loại nghỉ).
  - Ô **ngày thường T2–T6**: "Ca thường" + "Nghỉ chiều" (+ các loại nghỉ).
  - Ô **T7/CN**: chỉ "Ca T7-CN" (+ 1 lựa chọn "Nghỉ", không phân loại).
  - **Ca tối**: luôn là K15 (không chọn).

### 3.3 Loại nghỉ (OffType)

| Giá trị | Nhãn | Ghi chú xuất ra file Fast |
|---------|------|---------------------------|
| `leave` (**mặc định**) | Nghỉ | *(trống)* |
| `sick` | Nghỉ ốm | `Nghỉ ốm` |
| `business_trip` | Công tác | `Công tác` |
| `maternity_leave` | Nghỉ đẻ | `Nghỉ đẻ` |

### 3.4 Địa điểm
- 3 bộ: **NORMAL** (32 địa điểm), **EVENING** (5), **WEEKEND** (32, giống hệt NORMAL). Bảng đầy đủ ở Phụ lục A.3.
- **Khóa nội bộ** `key = "<TYPE>-<code>"`, VD `NORMAL-K1.1TD`, `EVENING-K1.BTD`, `WEEKEND-CS2`.
  Cùng một `code` ở các bộ khác nhau là các khóa khác nhau.
- Tên ngắn **có thể trùng** (VD 2 địa điểm tên "4CD": `K1.414417` và `K1.418423`) → khi hiển thị luôn kèm mã.
- **Thứ tự ưu tiên block** (dùng để sắp xếp file Làm tối & T7-CN): là thứ tự xuất hiện **lần đầu** của block trong bộ địa điểm tương ứng (xem 7.3, 7.4).

---

## 4. Mô hình dữ liệu v1 **[GIỮ — làm nguồn migrate]**

```ts
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type OffType = "leave" | "sick" | "business_trip" | "maternity_leave";

type DayEntry = {
  shiftCode: string | null;          // null = nghỉ
  offType: OffType | null;           // chỉ có nghĩa khi shiftCode = null; null được hiểu là "leave"
  locationKey: string | null;        // NORMAL-* (T2–T6) hoặc WEEKEND-* (T7, CN)
  extraEvening: boolean;             // có làm thêm ca tối K15 hôm đó
  eveningLocationKey: string | null; // EVENING-*
};

type EmployeeWeekRow = {
  defaultShiftCode: string | null;
  defaultOffType: OffType | null;
  defaultLocationKey: string | null;
  days: Record<DayKey, DayEntry>;
};

type WeekSheet = { weekStart: string /* YYYY-MM-DD, thứ Hai */; rows: Record<string /* employeeId */, EmployeeWeekRow> };

type AttendanceStore = { sheets: Record<string /* weekStart */, WeekSheet>; activeWeekStart: string | null };
```

**Lưu trữ v1:** toàn bộ `AttendanceStore` nằm trong **1 document Firestore** `attendance/main`
(thêm trường `updatedAt` = serverTimestamp). Đây là dữ liệu thật cần migrate sang v2 (mục 11.3).

**Bất biến:**
- Khi tạo tuần: mỗi nhân viên trong danh sách K1 chính + K2 có 1 `EmployeeWeekRow` rỗng
  (mọi ngày `shiftCode=null, offType=null, locationKey=null, extraEvening=false, eveningLocationKey=null`;
  mặc định đều `null`).
- `shiftCode != null` ⇒ `offType = null`.
- `shiftCode == null` ⇒ `locationKey = null` (khi đặt qua thao tác chọn ca).
- `extraEvening == false` ⇒ `eveningLocationKey = null`.
- **Ngày trống = Nghỉ (phép thường).** Tuần mới tạo nghĩa là mọi người nghỉ cả tuần cho đến khi được xếp ca.

**Migrate dữ liệu cũ (đã có ở v1, giữ ở v2):** payload thiếu `offType`/`defaultOffType` → nếu ca là `null`
thì gán `"leave"`, ngược lại `null`; thiếu `extraEvening` → `false`; thiếu các trường khác → `null`;
thiếu ngày → ngày rỗng. Chấp nhận cả dạng bọc `{ state: {...}, version }` lẫn dạng phẳng `{ sheets, activeWeekStart }`.

---

## 5. Chức năng & quy tắc nhập liệu **[GIỮ]**

### 5.1 Tạo / chọn tuần
- Nút **"Tạo bảng mới"** mở hộp thoại chọn tuần. Danh sách: tuần hiện tại **±4 tuần** (9 lựa chọn), mặc định tuần hiện tại.
  Nhãn: `T2 dd/MM – CN dd/MM/yyyy` (năm theo ngày CN).
- Nếu tuần đã tồn tại: hiện ghi chú "Tuần này đã có bảng — bấm Tạo sẽ mở bảng hiện có" → chỉ chuyển sang tuần đó, **không ghi đè**.
- Tạo xong → tuần mới thành tuần đang mở.
- Ô chọn tuần ở header liệt kê các tuần đã tạo, sắp xếp tăng dần theo ngày.
- Chưa có tuần nào → hiển thị trạng thái trống "Chưa có bảng chấm công".
- v1 **không có** xóa 1 tuần, sao chép tuần. **[V2]**

### 5.2 Tab "Ngày thường" (T2–T6) — nhóm K1 chính
Bảng: `Mã NV | Họ và tên | Mặc định | T2 dd/MM | … | T6 dd/MM`. Mỗi ô gồm 2 ô chọn: **Ca** và **Địa điểm** (bộ NORMAL).
Ô địa điểm **bị khóa** khi ca = nghỉ.

**Quy tắc cột Mặc định** (ghi đè T2→T6, không đụng T7/CN):
- Chọn **ca** X ⇒ `defaultShiftCode = X`, `defaultOffType = null`; với mỗi ngày T2–T6:
  `shiftCode = X`, `offType = null`, **giữ nguyên** `locationKey` của ngày.
- Chọn **loại nghỉ** Y ⇒ `defaultShiftCode = null`, `defaultOffType = Y`; mỗi ngày T2–T6:
  `shiftCode = null`, `offType = Y`, `locationKey = null`.
- Chọn **địa điểm** L ⇒ `defaultLocationKey = L`; mỗi ngày T2–T6: `locationKey = L` (kể cả ngày đang nghỉ — **[LỖI-V1]** nhỏ: tạo trạng thái nghỉ nhưng có địa điểm; không ảnh hưởng export vì ngày nghỉ bỏ qua địa điểm).
- Ghi đè **mọi** chỉnh sửa từng ngày trước đó mà không cảnh báo. **[V2]** cần cảnh báo/chỉ áp cho ngày chưa sửa (hỏi người dùng).
- **Không** đụng tới ca tối (`extraEvening`).

**Quy tắc ô từng ngày:**
- Chọn ca X ⇒ `shiftCode = X`, `offType = null`, giữ `locationKey`.
- Chọn loại nghỉ Y ⇒ `shiftCode = null`, `offType = Y` (không truyền ⇒ `leave`), `locationKey = null`.
- Chọn địa điểm ⇒ chỉ đổi `locationKey`. Có lựa chọn "-" để xóa địa điểm.

**Tìm kiếm nhân viên:** ô tìm theo mã NV hoặc tên, **không dấu, không phân biệt hoa thường**
(chuẩn hóa NFD + bỏ dấu; chuỗi tìm là chuỗi con của `"<mã> <họ tên>"`), độ trễ (debounce) 300 ms. Không có kết quả → "Không tìm thấy nhân viên phù hợp."

### 5.3 Tab "Tối" (ca tối T2–T6) — K1 chính + K2
- Hiển thị 5 thẻ T2…T6 (mỗi thẻ 1 màu riêng theo ngày).
- Mỗi thẻ: danh sách nhân viên đã phân công tối hôm đó (theo thứ tự danh sách nhân viên), mỗi dòng có
  ô chọn **địa điểm ca tối** (bộ EVENING) và nút xóa.
- Thêm: chọn nhân viên (chỉ những người **chưa** được phân công hôm đó) + địa điểm (tùy chọn) → "Thêm".
  ⇒ `extraEvening = true`, `eveningLocationKey = L`.
- Xóa ⇒ `extraEvening = false`, `eveningLocationKey = null`.
- **Không kiểm tra** nhân viên có ca ngày hôm đó hay không (người nghỉ vẫn được phân ca tối). **[HỎI]** có cần cảnh báo không.
- Không có ca tối cho T7/CN trong UI (dù mô hình dữ liệu cho phép).

### 5.4 Tab "T7-CN" — K1 chính + K2
Bảng: `Mã NV | Họ và tên | T7 dd/MM | CN dd/MM`. Không có cột mặc định.
- Ca: chỉ nhóm "Ca T7-CN" + lựa chọn "- Nghỉ -" (không phân loại nghỉ).
- Địa điểm: bộ WEEKEND; khóa khi nghỉ.

### 5.5 Các tab Export
4 tab: **Export Fast**, **Export Sớm**, **Export Tối**, **Export T7-CN**. Mỗi tab hiển thị **bảng xem trước**
đúng các dòng sẽ xuất + nút **"Xuất Excel"** (đang xuất → "Đang xuất…", lỗi → alert "Xuất Excel … thất bại").
Quy tắc từng file ở mục 7.

### 5.6 Xóa toàn bộ dữ liệu
Nút "Xóa dữ liệu" (khóa khi chưa có tuần) → xác nhận "Xóa toàn bộ dữ liệu chấm công? … Không thể hoàn tác"
→ xóa **tất cả tuần** (xóa document Firestore — ảnh hưởng mọi người dùng). **[V2]** thay bằng xóa từng tuần + phân quyền.

### 5.7 Ghi nhớ giao diện
- Tab đang chọn được lưu ở `localStorage` (`attendance-default-tab`), mặc định "Ngày thường".
- Mobile (< md): bảng chuyển thành danh sách thẻ thu gọn theo nhân viên; tiêu đề thẻ có các "badge" tóm tắt
  `T2 K07`, `T3 —`… Mở thẻ để sửa từng ngày.
- Màu theo ngày: T2 hồng, T3 xanh ngọc, T4 xanh trời, T5 nâu đỏ nhạt, T6 tím, T7 xanh rêu, CN cam đất; cột Mặc định màu vàng.

---

## 6. Đồng bộ & lưu trữ v1 (để hiểu, không bắt buộc giữ)

- Next.js static export (`output: "export"`) host trên Firebase Hosting; toàn bộ chạy ở trình duyệt.
- State bằng Zustand + middleware `persist`, storage tự viết ghi vào Firestore:
  - Mở app: đọc doc `attendance/main` → hiển thị "Đang tải dữ liệu…"; lỗi → thông báo + nút "Thử lại".
  - Mỗi thay đổi: **debounce 1,5 s** rồi `setDoc(merge: true)` **toàn bộ** store.
  - Đăng ký `onSnapshot` để nhận thay đổi từ máy khác, áp thẳng vào state (bỏ qua nếu giống hệt).
  - Chỉ báo đồng bộ ở header: đang lưu (spinner) / đã lưu (cloud check) / lỗi (cloud off, tooltip lỗi).
- Không có đăng nhập; Firestore rules cho phép **mọi người đọc/ghi** `attendance/*`.

---

## 7. Đặc tả 4 file Excel xuất **[GIỮ — đầu ra phải giống từng ô]**

### 7.0 Quy ước chung
- Mỗi file được tạo bằng cách **mở template `.xlsx` có sẵn**, ghi giá trị vào ô, giữ nguyên định dạng template, rồi tải về.
- Định dạng thời gian: số thập phân phần ngày (`(h*60+m)/1440`) + numFmt `hh:mm` (tránh lệch múi giờ).
- Định dạng ngày (file Sớm, Tối): giá trị Date UTC 00:00 + numFmt `dd/mm/yyyy`.
  File Fast ghi ngày dưới dạng **chuỗi** `dd/MM/yyyy`.
- Cột STT, Face ID, số giờ làm sớm: **không ghi** (để trống).
- Danh sách nhân viên duyệt theo thứ tự trong danh mục; nhân viên không có dòng dữ liệu trong tuần được coi như toàn bộ ngày trống.
- Tên file tải về dùng `weekStart` (`YYYY-MM-DD`).
- ⚠️ Template v1 `evening-attendance-empty.xlsx` chứa thêm nhiều sheet dữ liệu thật của các tuần cũ (người khác, MST, giờ Face ID),
  `weekend-attendance-empty.xlsx` chứa thêm sheet "10.5". Khi copy sang v2 **[V2]**: xóa các sheet thừa, chỉ giữ sheet được dùng.
  Các file `*-filled.xlsx` là ví dụ đã điền tay — chỉ dùng tham khảo.

### 7.1 File Fast — "Đăng ký công việc" (`Ca-lam-viec-<weekStart>.xlsx`)
- Template: `attendance-empty.xlsx`, sheet đầu tiên ("HDV"). Header ở dòng 3, **dữ liệu từ dòng 4**.
- Nhân viên: **K1 chính**.
- Cột ghi:

| Cột | Tiêu đề template | Giá trị |
|-----|------------------|---------|
| A (1) | Mã NV | `employeeId` |
| B (2) | Họ và tên | `fullName` |
| C (3) | Từ ngày | `fromDate` dạng chuỗi `dd/MM/yyyy` |
| D (4) | Đến ngày | `toDate` dạng chuỗi `dd/MM/yyyy` |
| E (5) | Ca làm việc | mã ca, hoặc `Nghỉ` |
| G (7) | Mã công việc | `K006` nếu dòng **không phải** `Nghỉ` |
| I (9) | Mã địa điểm | mã địa điểm (nếu có) |
| J (10) | *(không tiêu đề)* | Ghi chú (nếu có) |

- Dòng là **1 ngày T7 hoặc CN** (`fromDate = toDate` và rơi vào T7/CN): tô nền ô C, D màu `FFCFE2F3` (rgb 207,226,243).

**Thuật toán tạo dòng cho 1 nhân viên** (kết quả là danh sách "đoạn" — segment):

*T2→T6* — tạo 3 loại đoạn, mỗi loại **gộp các ngày liên tiếp** khi thỏa điều kiện gộp:
1. **work**: ngày có `shiftCode != null`. Gộp khi **cùng mã ca VÀ cùng mã địa điểm**. Ca = mã ca, địa điểm = mã địa điểm của `locationKey`.
2. **off**: ngày có `shiftCode == null`. Gộp khi **cùng loại nghỉ** (null coi là `leave`). Ca = `Nghỉ`, địa điểm trống.
3. **evening**: ngày có `extraEvening`. Gộp khi **cùng mã địa điểm ca tối**. Ca = `K15`, địa điểm = mã của `eveningLocationKey`.

Một ngày không thuộc loại đó sẽ **cắt** chuỗi (VD T2,T3 K07 – T4 K37 – T5 K07 ⇒ 3 đoạn: T2–T3 K07, T4 K37, T5 K07).

*T7, CN* — **không gộp**, mỗi ngày:
- có ca ⇒ 1 đoạn work (ca, mã địa điểm); không ca ⇒ 1 đoạn off `Nghỉ` **không ghi chú** (loại nghỉ cuối tuần bị bỏ qua);
- nếu `extraEvening` ⇒ thêm 1 đoạn evening K15.

*Sắp xếp* các đoạn của nhân viên: theo `fromDate` tăng dần, cùng ngày thì `work` < `off` < `evening`.
Nhân viên lần lượt theo thứ tự danh mục.

*Biến đổi khi ghi:*
- Mã ca `2K44` được ghi thành **`2K43`** (quy tắc riêng của Fast).
- Ghi chú: nếu mã ca (trước biến đổi) thuộc nhóm **Nghỉ chiều** ⇒ `Nghỉ chiều`;
  nếu là đoạn off ⇒ ghi chú theo loại nghỉ (mục 3.3; `leave` ⇒ trống); còn lại trống.

### 7.2 File Làm sớm (`Lam-som-<weekStart>.xlsx`)
- Template: `early-attendance-empty.xlsx`, sheet đầu tiên. **Dòng 3, cột A** = `NGÀY dd-dd/M/yyyy`
  (ngày T2 và T6 2 chữ số, tháng & năm theo T6 — VD tuần 2026-05-04 ⇒ `NGÀY 04-08/5/2026`).
  **[LỖI-V1]** tuần vắt tháng sai (VD tuần 2026-04-27 ⇒ `NGÀY 27-01/5/2026`); **[HỎI]** định dạng mong muốn, VD `NGÀY 27/4-01/5/2026`.
- **Dữ liệu từ dòng 6.** Nhân viên: **K1 chính**. Ngày: **T2→T6**, mỗi (nhân viên, ngày) 1 dòng, duyệt theo nhân viên rồi theo ngày.
- **Điều kiện có dòng:** ngày có ca **VÀ** mã ca **không** thuộc {`K18`, `K39`} (ca bắt đầu 7h30 = không làm sớm)
  **VÀ** địa điểm **không phải** `NORMAL-CS2`.
- Cột ghi:

| Cột | Giá trị |
|-----|---------|
| B (2) | Mã NV |
| C (3) | Họ và tên |
| D (4) | Ngày làm (Date, `dd/mm/yyyy`) |
| E (5) | Chức danh: `Chuyên viên` nếu là quản lý `23160`, ngược lại `HDV` |
| H (8) | Giờ bắt đầu được phân công = giờ bắt đầu ca |
| I (9) | Giờ kết thúc được phân công = giờ kết thúc ca; **riêng ca Nghỉ chiều ⇒ 16:30** |
| L (12) | Công việc: `Quản lý HDV` nếu là `23160`, ngược lại `Hướng dẫn bệnh nhân` |
| M (13) | Block của địa điểm (nếu có) |
| N (14) | MST |
| P (16) | Ghi chú: `Nghỉ chiều` nếu ca thuộc nhóm Nghỉ chiều |

- **[LỖI-V1]** cột O (15) "Ghi chú (Tên đơn vị)" không được ghi; file mẫu điền tay có `TTKB&ĐTTN`. **[HỎI]** có cần điền `TTKB&ĐTTN` không.
- Bảng xem trước hiển thị: Mã NV, Họ tên, Chức danh, Ngày làm, Bắt đầu ca, Kết thúc ca, Công việc, Địa điểm, MST, Ghi chú.

### 7.3 File Làm tối (`Lam-toi-<weekStart>.xlsx`)
- Template: `evening-attendance-empty.xlsx`, sheet **`Sheet1`**. **Dòng 3, cột D** = `TỪ dd/MM/yyyy ĐẾN dd/MM/yyyy` (T2 → T6).
- **Dữ liệu từ dòng 6.** Nhân viên: **K1 chính + K2**. Ngày: T2→T6.
- **Điều kiện có dòng:** `extraEvening = true`.
- **Thứ tự:** theo ngày T2→T6; trong 1 ngày sắp theo **ưu tiên block** của địa điểm ca tối
  (thứ tự block trong bộ EVENING: `Tầng 2`=1, `Tầng 3`=2, `Tầng 5`=3, `Tầng 7`=4, `Tầng B1`=5; chưa có địa điểm = cuối);
  cùng ưu tiên giữ thứ tự danh mục nhân viên (sắp xếp ổn định).
- Cột ghi:

| Cột | Giá trị |
|-----|---------|
| B (2) | Mã NV |
| C (3) | Họ và tên |
| D (4) | Ngày làm (Date `dd/mm/yyyy`) |
| E (5) | `HDV` |
| H (8) | `16:30` (giờ bắt đầu ca K15) |
| I (9) | `20:00` (giờ kết thúc ca K15) |
| J (10) | `Hướng dẫn` |
| K (11) | Block của địa điểm ca tối (nếu có) |
| L (12) | MST |
| M (13) | `TTKB&ĐTTN` |

### 7.4 File T7-CN (`T7-CN-<weekStart>.xlsx`)
- Template: `weekend-attendance-empty.xlsx`, 2 sheet **`T7`** và **`CN`**.
  **Dòng 1, cột A** mỗi sheet = `KHÁM CHỮA BỆNH THỨ 7 NGÀY dd/M/yyyy` / `KHÁM CHỮA BỆNH CHỦ NHẬT NGÀY dd/M/yyyy`
  (ngày 2 chữ số, tháng không đệm 0 — VD `09/5/2026`).
- **Dữ liệu từ dòng 4** trên từng sheet. Nhân viên: **K1 chính + K2**.
- **Điều kiện có dòng:** ngày có ca **VÀ** địa điểm **không phải** `WEEKEND-CS2`.
- **Thứ tự** trong mỗi sheet: theo **ưu tiên block** của bộ WEEKEND (thứ tự xuất hiện lần đầu:
  `Tầng 1`, `Tầng 2`, `Tầng 3`, `Tầng 4`, `Tầng 5`, `Tầng 6`, `Quầy thông tin`, `Tầng 2 nhà P`, `Tầng B1`, `Tầng 7`, `CS2`;
  chưa có địa điểm = cuối), cùng ưu tiên giữ thứ tự danh mục.
- Cột ghi:

| Cột | Giá trị |
|-----|---------|
| B (2) | Mã NV |
| C (3) | Họ và tên |
| D (4) | `HDV` |
| G (7) | Giờ bắt đầu ca |
| H (8) | Giờ kết thúc ca |
| I (9) | `HDNB` |
| J (10) | Block của địa điểm (nếu có) |
| K (11) | MST |
| L (12) | `TTKB&ĐTTN` |

- Ca tối T7/CN (nếu có trong dữ liệu) **không** xuất ra file này.

---

## 8. Tổng hợp hằng số nghiệp vụ đang hard-code ở v1

Ở v2 các giá trị này phải nằm trong **cấu hình** (bảng `settings`/`export_rules`), có giao diện sửa cho admin.

| Hằng số | Giá trị | Dùng ở |
|---------|---------|--------|
| Mã công việc Fast | `K006` | 7.1 |
| Nhãn nghỉ | `Nghỉ` | 7.1 |
| Mã ca tối | `K15` | 5.3, 7.1, 7.3 |
| Đổi mã ca khi xuất Fast | `2K44 → 2K43` | 7.1 |
| Màu nền ngày cuối tuần (Fast) | `FFCFE2F3` | 7.1 |
| Ca không tính làm sớm | `K18`, `K39` | 7.2 |
| Địa điểm loại khỏi Làm sớm | `NORMAL-CS2` | 7.2 |
| Địa điểm loại khỏi T7-CN | `WEEKEND-CS2` | 7.4 |
| Giờ kết thúc phân công cho ca Nghỉ chiều (Làm sớm) | `16:30` | 7.2 |
| Mã NV quản lý | `23160` | 7.2 |
| Chức danh mặc định / quản lý (Làm sớm) | `HDV` / `Chuyên viên` | 7.2 |
| Công việc mặc định / quản lý (Làm sớm) | `Hướng dẫn bệnh nhân` / `Quản lý HDV` | 7.2 |
| Chức danh & công việc (Tối) | `HDV` / `Hướng dẫn` | 7.3 |
| Chức danh & công việc (T7-CN) | `HDV` / `HDNB` | 7.4 |
| Tên đơn vị | `TTKB&ĐTTN` | 7.3, 7.4 |
| Dòng bắt đầu dữ liệu | Fast 4 · Sớm 6 · Tối 6 · T7-CN 4 | 7.x |

---

## 9. Lỗi & hạn chế đã biết của v1 **[LỖI-V1]** — v2 phải xử lý

| # | Vấn đề | Hậu quả | Hướng xử lý v2 |
|---|--------|---------|----------------|
| 1 | Không đăng nhập; Firestore rules mở hoàn toàn | Ai có URL cũng đọc/sửa/xóa được dữ liệu, gồm MST nhân viên | Đăng nhập + phân quyền + rules chặt (11.1) |
| 2 | Toàn bộ dữ liệu ở **1 document** | Giới hạn 1 MB/doc của Firestore → sẽ hỏng khi đủ nhiều tuần; mỗi lần sửa ghi lại cả kho | Tách document theo tuần (11.2) |
| 3 | Ghi đè cả kho, debounce 1,5 s, last-write-wins | 2 người sửa cùng lúc mất dữ liệu của nhau; snapshot từ xa có thể đè chỉnh sửa chưa lưu, rồi bản cũ lại được ghi đè lên | Ghi theo từng ô (field-path update) / transaction, có trạng thái lưu từng ô |
| 4 | `activeWeekStart` lưu chung trên server | Một người đổi tuần → màn hình mọi người khác cũng nhảy tuần | Tuần đang xem là state cục bộ / URL (`/weeks/2026-05-04`) |
| 5 | Danh mục hard-code; thêm nhân viên mới sau khi đã tạo tuần | Tuần cũ không có dòng cho nhân viên mới → ô trống không sửa được, thao tác cột mặc định có thể **crash** | Danh mục trong DB, dòng tuần tạo **lười** (thiếu thì coi như rỗng) |
| 6 | Xóa nhân viên = comment-out code | Nhân viên biến mất khỏi cả tuần cũ & export cũ | Cờ `active` + ngày hiệu lực; tuần cũ giữ danh sách tại thời điểm đó |
| 7 | `setDoc(merge:true)` không xóa được key | Dữ liệu rác tích tụ | Cấu trúc mới, xóa tường minh |
| 8 | Header Làm sớm sai khi tuần vắt tháng | File sai tiêu đề | Sửa định dạng (hỏi người dùng) |
| 9 | File Làm sớm thiếu cột O "Tên đơn vị" | Phải điền tay | Hỏi & bổ sung |
| 10 | Cột mặc định ghi đè chỉnh sửa từng ngày không cảnh báo | Mất công sửa | Xác nhận hoặc chỉ áp ngày chưa chỉnh |
| 11 | Không có kiểm tra hợp lệ | Có ca nhưng thiếu địa điểm, ca tối thiếu địa điểm, nghỉ nhưng có ca tối… vẫn xuất bình thường | Bảng cảnh báo trước khi xuất (11.4) |
| 12 | "Xóa dữ liệu" xóa **mọi tuần** của mọi người | Rủi ro mất toàn bộ | Xóa từng tuần, chỉ admin, có xác nhận gõ tên tuần; soft-delete |
| 13 | Không có lịch sử thay đổi | Không biết ai sửa gì | Audit log |
| 14 | Chỉ chọn tuần trong ±4 tuần | Không nhập bù tuần xa được | Chọn ngày bất kỳ (lịch) |
| 15 | Template chứa dữ liệu cá nhân của các tuần cũ | Rò rỉ dữ liệu khi phát tán file | Làm sạch template |
| 16 | Loại nghỉ T7/CN không ghi nhận | Không biết nghỉ ốm/công tác cuối tuần | **[HỎI]** có cần không |
| 17 | Tìm kiếm bỏ dấu bằng NFD không xử lý chữ `đ/Đ` | Gõ `dao` không tìm ra "Đào Yến Linh" | Thay `đ→d`, `Đ→D` trước khi so khớp |

---

## 10. Yêu cầu phi chức năng (v1 đã có, v2 giữ)

- Giao diện **tiếng Việt**, chạy tốt trên **điện thoại** (danh sách thẻ) và máy tính (bảng có cột Mã NV + Họ tên cố định khi cuộn ngang).
- Ô chọn ca/địa điểm/nhân viên là combobox **có tìm kiếm** (tìm theo mã, tên, khung giờ/tầng).
- Xem trước dữ liệu xuất ngay trên web trước khi tải file.
- Cập nhật real-time giữa các máy.
- Hiệu năng: ~50 nhân viên × 7 ngày × 2 ô chọn không được giật khi nhập (v1 dùng memo + selector theo ô + render tab trễ).

---

## 11. Yêu cầu v2 **[V2]**

Mức ưu tiên: **P0** = bắt buộc cho bản v2 đầu tiên · **P1** = nên có · **P2** = mở rộng sau.

### 11.1 Người dùng & phân quyền (P0)
- Đăng nhập (Google / email). Vai trò:
  - **admin**: quản lý danh mục, cấu hình export, người dùng, khóa/mở tuần, xóa tuần.
  - **editor**: xếp ca, phân ca tối, xuất file.
  - **viewer**: chỉ xem & xuất file.
- Rules phía server chặn theo vai trò; MST chỉ hiển thị cho editor/admin.

### 11.2 Mô hình dữ liệu v2 (P0) — đề xuất (Firestore; nếu dùng SQL thì chuyển tương đương)

```
employees/{employeeId}       { fullName, taxCode, groups: ["K1"|"K2"], role: "staff"|"manager",
                               active, activeFrom?, activeTo?, sortOrder }
shifts/{code}                { name, startTime "HH:mm", endTime "HH:mm",
                               categories: ["regular"|"evening"|"weekend"|"half_day"], sortOrder, active }
locations/{type-code}        { type: "NORMAL"|"EVENING"|"WEEKEND", code, name, block, sortOrder, active }
blocks/{type-block}          { type, block, priority }            // ưu tiên sắp xếp tường minh thay vì suy ra
offTypes/{value}             { label, exportNote, sortOrder }
settings/export              { các hằng số ở mục 8 }
weeks/{weekStart}            { status: "draft"|"locked", createdBy, createdAt, updatedAt,
                               rosterSnapshot: [employeeId...] }  // danh sách NV tại thời điểm tạo tuần
weeks/{weekStart}/rows/{employeeId}
                             { defaultShiftCode, defaultOffType, defaultLocationKey,
                               days: { mon: DayEntry, ... } , updatedAt, updatedBy }
auditLogs/{autoId}           { weekStart, employeeId, path, before, after, by, at }
```

- Mỗi thao tác chỉ cập nhật đúng trường thay đổi (`updateDoc(row, { "days.mon.shiftCode": "K07", ... })`) → không ghi đè lẫn nhau.
- Tuần ở trạng thái `locked` thì không sửa được (trừ admin mở khóa).
- Thứ tự ưu tiên block được lưu tường minh (`blocks.priority`), giá trị seed = thứ tự ở mục 7.3/7.4.

### 11.3 Migration từ v1 (P0)
- Script/trang admin đọc doc `attendance/main` (định dạng mục 4), chạy hàm chuẩn hóa (mục 4 "Migrate dữ liệu cũ"),
  ghi sang `weeks/*` + `rows/*`. Idempotent (chạy lại không nhân đôi). Bỏ qua `activeWeekStart`.
- Seed danh mục từ **Phụ lục A**; nhóm `K1` = danh sách K1 chính, `K2` = danh sách K2; giữ nguyên thứ tự làm `sortOrder`.
- Kiểm tra sau migrate: với mỗi tuần, 4 file export từ dữ liệu v2 **giống hệt** export từ dữ liệu v1.

### 11.4 Cải tiến chức năng
**P0**
- Sửa tất cả lỗi mục 9 (#1–#7, #11, #12).
- **Kiểm tra hợp lệ + cảnh báo** (hiển thị ở ô và tổng hợp trên tab Export, không chặn xuất):
  có ca nhưng thiếu địa điểm; ca tối thiếu địa điểm; ca tối vào ngày nghỉ; mã ca/địa điểm không còn trong danh mục;
  nhân viên chưa được xếp ca cả tuần.
- Xóa 1 tuần (admin, soft-delete).
- Chọn tuần bất kỳ bằng lịch; URL theo tuần.

**P1**
- **Sao chép từ tuần trước** (ca, địa điểm, ca tối — tùy chọn từng phần).
- **Mẫu ca cố định** theo nhân viên (ca/địa điểm hay dùng) để điền nhanh.
- Nhập nhanh bằng bàn phím trên lưới (phím mũi tên, gõ mã ca), dán từ Excel.
- **Bảng tổng hợp độ phủ**: số người theo địa điểm/block theo từng ngày, theo ca tối; cảnh báo địa điểm không có người.
- Xuất **cả 4 file một lần** (zip); tự điền cột STT; sửa header Làm sớm & cột đơn vị (sau khi hỏi).
- Khóa tuần sau khi đã xuất/nộp; ghi lại thời điểm xuất.
- Lịch sử thay đổi (audit) xem theo tuần/nhân viên.

**P2**
- Nhập file giờ Face ID → điền cột Giờ vào/Giờ ra, tính **số giờ làm sớm/ngày** và tổng (cột J, K file Làm sớm).
- Báo cáo tháng: tổng ngày công, ngày nghỉ theo loại, số ca tối, số ngày T7-CN theo nhân viên.
- PWA / dùng offline có hàng đợi đồng bộ.

### 11.5 Kiến trúc đề xuất cho v2
> Nếu repo v2 đã có stack riêng, ưu tiên stack đó. Nếu chưa, đề xuất:

- **Next.js (App Router) + TypeScript strict**, Tailwind + shadcn/ui (Radix), Zustand hoặc TanStack Query cho state server.
- **Firebase** (Auth + Firestore + Hosting) để migrate dễ; hoặc Supabase/Postgres nếu muốn SQL (khi đó dùng ràng buộc khóa ngoại cho mã ca/địa điểm).
- **ExcelJS** để điền template (giữ được định dạng template).
- Cấu trúc thư mục:
  ```
  src/domain/        # kiểu dữ liệu, quy tắc nhập liệu (mục 5), tạo dòng export (mục 7) — hàm thuần, KHÔNG import UI/Firebase
  src/domain/__tests__/  # golden tests mục 12
  src/data/          # repository Firestore/SQL, migration v1
  src/export/        # điền template ExcelJS từ dòng export của domain
  src/features/...   # UI theo tab
  ```
- Hàm domain nhận **danh mục làm tham số** (không import hằng số) để test được và cấu hình được, VD
  `buildFastRows(week, rows, catalog, settings) → FastRow[]`.

### 11.6 Lộ trình triển khai đề xuất
1. Domain + seed danh mục + golden tests (mục 12) → pass.
2. Tầng dữ liệu v2 + migration v1 + kiểm tra export giống nhau.
3. Auth, phân quyền, rules.
4. UI nhập liệu (Ngày thường, Tối, T7-CN) mobile + desktop.
5. UI export 4 file + cảnh báo hợp lệ.
6. Trang admin danh mục & cấu hình.
7. Các mục P1, rồi P2.

---

## 12. Golden test cases **[GIỮ]** (đã chạy với code v1)

Tuần `weekStart = 2026-05-04` (T2 04/05 … CN 10/05/2026). Dữ liệu ban đầu: tuần rỗng.

### TC-1: Tuần rỗng — file Fast
Nhân viên `24662 Nguyễn Trà My` không được xếp gì ⇒ 3 dòng:

| Từ ngày | Đến ngày | Ca | Mã địa điểm | Ghi chú |
|---------|----------|----|-------------|---------|
| 04/05/2026 | 08/05/2026 | Nghỉ | | |
| 09/05/2026 | 09/05/2026 | Nghỉ | | |
| 10/05/2026 | 10/05/2026 | Nghỉ | | |

Cả 3 file Sớm, Tối, T7-CN: **0 dòng**.

### TC-2: Kịch bản đầy đủ
Thao tác theo thứ tự:
1. `24662`: Mặc định ca `K07`; Mặc định địa điểm `NORMAL-K1.1TD` (Tầng 1).
2. `24662`: T4 đổi ca `K37` (Nghỉ chiều, giữ địa điểm Tầng 1); T6 chọn nghỉ loại `sick`.
3. `24662`: Ca tối T2 và T3, địa điểm `EVENING-K1.BTD` (B1).
4. `24662`: T7 ca `K06`, địa điểm `WEEKEND-K1.2TDSA` (Siêu âm, block Tầng 2). CN để trống.
5. `24660 Vũ Quốc Bảo`: Ca tối T2 địa điểm `EVENING-K1.2TDSA` (Siêu âm, block Tầng 2).
6. `24660`: Mặc định ca `2K44`, mặc định địa điểm `NORMAL-CS2`.

**Trạng thái dòng `24662` sau thao tác:**
```json
{"defaultShiftCode":"K07","defaultOffType":null,"defaultLocationKey":"NORMAL-K1.1TD","days":{
 "mon":{"shiftCode":"K07","offType":null,"locationKey":"NORMAL-K1.1TD","extraEvening":true,"eveningLocationKey":"EVENING-K1.BTD"},
 "tue":{"shiftCode":"K07","offType":null,"locationKey":"NORMAL-K1.1TD","extraEvening":true,"eveningLocationKey":"EVENING-K1.BTD"},
 "wed":{"shiftCode":"K37","offType":null,"locationKey":"NORMAL-K1.1TD","extraEvening":false,"eveningLocationKey":null},
 "thu":{"shiftCode":"K07","offType":null,"locationKey":"NORMAL-K1.1TD","extraEvening":false,"eveningLocationKey":null},
 "fri":{"shiftCode":null,"offType":"sick","locationKey":null,"extraEvening":false,"eveningLocationKey":null},
 "sat":{"shiftCode":"K06","offType":null,"locationKey":"WEEKEND-K1.2TDSA","extraEvening":false,"eveningLocationKey":null},
 "sun":{"shiftCode":null,"offType":null,"locationKey":null,"extraEvening":false,"eveningLocationKey":null}}}
```

**File Fast — 24662** (đúng thứ tự):

| Từ ngày | Đến ngày | Ca | Mã CV | Mã địa điểm | Ghi chú |
|---------|----------|----|-------|-------------|---------|
| 04/05/2026 | 05/05/2026 | K07 | K006 | K1.1TD | |
| 04/05/2026 | 05/05/2026 | K15 | K006 | K1.BTD | |
| 06/05/2026 | 06/05/2026 | K37 | K006 | K1.1TD | Nghỉ chiều |
| 07/05/2026 | 07/05/2026 | K07 | K006 | K1.1TD | |
| 08/05/2026 | 08/05/2026 | Nghỉ | | | Nghỉ ốm |
| 09/05/2026 | 09/05/2026 | K06 | K006 | K1.2TDSA | | ← tô nền C,D |
| 10/05/2026 | 10/05/2026 | Nghỉ | | | | ← tô nền C,D |

**File Fast — 24660:**

| Từ ngày | Đến ngày | Ca | Mã CV | Mã địa điểm | Ghi chú |
|---------|----------|----|-------|-------------|---------|
| 04/05/2026 | 08/05/2026 | **2K43** | K006 | CS2 | Nghỉ chiều |
| 04/05/2026 | 04/05/2026 | K15 | K006 | K1.2TDSA | |
| 09/05/2026 | 09/05/2026 | Nghỉ | | | |
| 10/05/2026 | 10/05/2026 | Nghỉ | | | |

**File Làm sớm** (24660 bị loại vì địa điểm CS2; T6 của 24662 nghỉ ⇒ không có):

| Mã NV | Ngày | Chức danh | Bắt đầu | Kết thúc | Công việc | Block | MST | Ghi chú (P) |
|-------|------|-----------|---------|----------|-----------|-------|-----|-------------|
| 24662 | 04/05/2026 | HDV | 06:00 | 16:30 | Hướng dẫn bệnh nhân | Tầng 1 | 8712601809 | |
| 24662 | 05/05/2026 | HDV | 06:00 | 16:30 | Hướng dẫn bệnh nhân | Tầng 1 | 8712601809 | |
| 24662 | 06/05/2026 | HDV | 06:00 | **16:30** | Hướng dẫn bệnh nhân | Tầng 1 | 8712601809 | Nghỉ chiều |
| 24662 | 07/05/2026 | HDV | 06:00 | 16:30 | Hướng dẫn bệnh nhân | Tầng 1 | 8712601809 | |

**File Làm tối** (T2: 24660 trước vì block Tầng 2 ưu tiên 1 < Tầng B1 ưu tiên 5):

| Ngày | Mã NV | Họ tên | Bắt đầu | Kết thúc | Công việc | Block | MST | Đơn vị |
|------|-------|--------|---------|----------|-----------|-------|-----|--------|
| 04/05/2026 | 24660 | Vũ Quốc Bảo | 16:30 | 20:00 | Hướng dẫn | Tầng 2 | 8672370334 | TTKB&ĐTTN |
| 04/05/2026 | 24662 | Nguyễn Trà My | 16:30 | 20:00 | Hướng dẫn | Tầng B1 | 8712601809 | TTKB&ĐTTN |
| 05/05/2026 | 24662 | Nguyễn Trà My | 16:30 | 20:00 | Hướng dẫn | Tầng B1 | 8712601809 | TTKB&ĐTTN |

Header D3: `TỪ 04/05/2026 ĐẾN 08/05/2026`.

**File T7-CN:** sheet `T7` (A1 = `KHÁM CHỮA BỆNH THỨ 7 NGÀY 09/5/2026`) có 1 dòng:
`24662 | Nguyễn Trà My | HDV | 06:00 | 16:30 | HDNB | Tầng 2 | 8712601809 | TTKB&ĐTTN`.
Sheet `CN` (A1 = `KHÁM CHỮA BỆNH CHỦ NHẬT NGÀY 10/5/2026`) không có dòng.

### TC-3: Các quy tắc đơn lẻ (cần viết test riêng)
- Gộp đoạn work bị cắt khi đổi địa điểm: T2–T3 K07@Tầng 1, T4–T5 K07@T3 ⇒ 2 dòng Fast.
- Gộp off theo loại: T2–T3 `sick`, T4 `leave`, T5–T6 `sick` ⇒ 3 dòng `Nghỉ` (Nghỉ ốm / trống / Nghỉ ốm).
- Ca `K18` hoặc `K39` ⇒ không có dòng Làm sớm.
- Ca T7 có địa điểm `WEEKEND-CS2` ⇒ không có dòng T7-CN (nhưng vẫn có dòng Fast).
- Ca T7 không có địa điểm ⇒ dòng T7-CN xếp **cuối** sheet, cột Block trống.
- Đặt mặc định = nghỉ `business_trip` ⇒ T2–T6 đều nghỉ Công tác, địa điểm bị xóa; Fast: 1 dòng 04–08/05 `Nghỉ` ghi chú `Công tác`.
- Chọn ca rồi chọn nghỉ ở 1 ngày ⇒ địa điểm ngày đó bị xóa; chọn lại ca ⇒ địa điểm vẫn trống.
- Bỏ phân công ca tối ⇒ `eveningLocationKey` bị xóa.
- Thời gian Excel: `toExcelTime(6:00) = 0.25`, `toExcelTime(16:30) = 990/1440`.
- Tìm kiếm: `"tra my"` khớp "Nguyễn Trà My"; `"24662"` khớp theo mã; `"NGUYEN"` khớp mọi tên có "Nguyễn";
  **[V2]** `"dao"` phải khớp "Đào Yến Linh" (v1 không khớp — lỗi #17).
- Header Làm sớm tuần 2026-05-04 ⇒ `NGÀY 04-08/5/2026`.
- Migration: payload v1 có ngày `{shiftCode:null}` không có `offType` ⇒ sau chuẩn hóa `offType = "leave"`.

---

## 13. Câu hỏi mở cần hỏi người dùng trước khi code v2 **[HỎI]**

1. Ý nghĩa nhóm mã ca tiền tố `2` (2K43, 2K04, 2K44, 2K36)? Vì sao Fast cần đổi `2K44 → 2K43` mà không đổi các ca Nghỉ chiều khác?
2. Định dạng header file Làm sớm khi tuần vắt sang tháng mới?
3. File Làm sớm có cần điền cột O "Tên đơn vị" = `TTKB&ĐTTN` không?
4. Có cần phân loại nghỉ (ốm/công tác/đẻ) cho T7-CN và xuất ghi chú lên Fast không?
5. Có cho phép ca tối vào T7/CN không? Có cần ca tối xuất hiện ở file khác ngoài Fast và Làm tối?
6. Có cần cảnh báo khi phân ca tối cho người nghỉ ngày đó?
7. Cột Mặc định: ghi đè hết hay chỉ áp cho ngày chưa sửa tay?
8. Nhân viên nhóm K2 có cần xuất hiện ở tab Ngày thường/Fast/Làm sớm không (hiện không)?
9. Ngoài quản lý `23160`, có thêm vai trò/chức danh đặc biệt nào?
10. Ai được phép xem MST? Có cần ẩn MST trên giao diện?
11. Giữ Firebase hay chuyển sang SQL? Có cần giữ URL/hosting cũ?
12. Có cần dùng offline không?

---

## Phụ lục A — Dữ liệu danh mục (seed cho v2)

> Dữ liệu dưới đây chứa **MST cá nhân** — chỉ dùng làm seed nội bộ; không công khai repo chứa tài liệu này.

### A.1 Nhân viên

**Nhóm K1 chính** (thứ tự = thứ tự hiển thị/xuất):

| # | Mã NV | Họ và tên | MST |
|---|-------|-----------|-----|
| 1 | 24662 | Nguyễn Trà My | 8712601809 |
| 2 | 25120 | Phùng Thị Thu Dung | 8643231618 |
| 3 | 23380 | Trần Như Quỳnh | 8459978969 |
| 4 | 24643 | Nguyễn Phương Anh | 8712601862 |
| 5 | 24676 | Trần Phương Linh | 8571254148 |
| 6 | 24666 | Trần Bích Hà | 8712601799 |
| 7 | 24675 | Đào Yến Linh | 8614248279 |
| 8 | 24678 | An Lâm Ngọc | 8640818380 |
| 9 | 24687 | Đào Thị Hải Yến | 8532343355 |
| 10 | 24665 | Lê Hồng Dương | 8712601904 |
| 11 | 23745 | Phạm Thị Thu Trang | 8437660185 |
| 12 | 29121 | Nguyễn Thị Linh | 8615412450 |
| 13 | 30070 | Phạm Thị Thu | 8657412036 |
| 14 | 24669 | Nguyễn Thị Hương | 8682241088 |
| 15 | 24677 | Phạm Cẩm Ly | 8712601830 |
| 16 | 23743 | Đào Thị Lan Anh | 8323732196 |
| 17 | 23750 | Vũ Thị Thanh Hồng | 8511395440 |
| 18 | 24667 | Nguyễn Thị Hòa | 8023539184 |
| 19 | 30062 | Hoàng Thị Vân Anh | 8451794649 |
| 20 | 24642 | Hoàng Phương Anh | 871260781 |
| 21 | 30067 | Ngô Văn Sơn | 8650673328 |
| 22 | 24660 | Vũ Quốc Bảo | 8672370334 |
| 23 | 24679 | Nguyễn Thị Hồng Ngọc | 8510675117 |
| 24 | 24680 | Đoàn Thị Nhung | 8400971427 |
| 25 | 24644 | Nguyễn Phương Anh | 8643231625 |
| 26 | 19439 | Nguyễn Thị Bích Hằng | 8097507243 |
| 27 | 19433 | Đỗ Thị Ngọc Diệp | 8480133731 |
| 28 | 19434 | Lê Quang Trung | 8429284755 |
| 29 | 23741 | Vũ Quang Anh | 8712601887 |
| 30 | 23746 | Nguyễn Ngọc Hoàng Yến | 8439532809 |
| 31 | 30063 | Nguyễn Thị Mai Trang | 8718750395 |
| 32 | 30066 | Vương Thị Ngọc Ánh | 8614690529 |
| 33 | 30064 | Đỗ Minh Khuê | 8625569965 |
| 34 | 30068 | Nguyễn Thị Minh Hòa | 8571815717 |
| 35 | 30065 | Hoàng Thị Thủy | 8573268202 |
| 36 | 23160 | PHAN THỊ HỒNG THÚY *(quản lý HDV)* | 8009287175 |

Nhân viên đã nghỉ (seed với `active = false`): `30061` Nguyễn Quỳnh Chi (8691036014),
`24663` Nguyễn Thị Minh Bình (8346737987), `24683` Phan Minh Tuấn (8514611749).

> Lưu ý dữ liệu: MST của `24642` chỉ có 9 chữ số (`871260781`) — có thể nhập thiếu, **[HỎI]** xác nhận.
> Tên `23160` viết hoa toàn bộ — có thể chuẩn hóa hiển thị nhưng giữ nguyên khi xuất nếu người dùng muốn.

**Nhóm K2:**

| # | Mã NV | Họ và tên | MST |
|---|-------|-----------|-----|
| 1 | 19435 | Ngô Thị Ánh Nguyệt | 0105209369 |
| 2 | 19441 | Nguyễn Thị Hoa | 8338107607 |
| 3 | 19440 | Nguyễn Thị Chuyên | 8338107597 |
| 4 | 19437 | Nguyễn Hải Quyên | 8119343471 |
| 5 | 19431 | Đặng Lan Phương | 8480133805 |
| 6 | 19169 | Đỗ Như Thành | 8626680596 |
| 7 | 23420 | Nguyễn Thị Thu Hồng | 8115110652 |
| 8 | 30069 | Đặng Thị Thu Phương | 8425272170 |
| 9 | 19436 | Nguyễn Diệu Hoa | 8331453125 |
| 10 | 23744 | Trần Thị Hương | 8556638559 |
| 11 | 24686 | Vũ Anh Văn | 8124737947 |

### A.2 Ca làm việc

| Mã | Tên (khung giờ) | Nhóm | Bắt đầu | Kết thúc |
|----|-----------------|------|---------|----------|
| K02 | 5h00-16h30 | Ca thường | 05:00 | 16:30 |
| K04 | 5h30-16h30 | Ca thường | 05:30 | 16:30 |
| K07 | 6h00-16h30 | Ca thường | 06:00 | 16:30 |
| K14 | 6h30-18h30 | Ca thường | 06:30 | 18:30 |
| K18 | 7h30-17h00 | Ca thường | 07:30 | 17:00 |
| 2K43 | 6h30-16h30 | Ca thường **và** Ca T7-CN | 06:30 | 16:30 |
| 2K04 | 5h30-16h30 | Ca thường | 05:30 | 16:30 |
| K15 | 16h30-20h00 | Ca tối | 16:30 | 20:00 |
| K01 | 5h00-15h30 | Ca T7-CN | 05:00 | 15:30 |
| K03 | 5h30-16h00 | Ca T7-CN | 05:30 | 16:00 |
| K06 | 6h00-16h30 | Ca T7-CN | 06:00 | 16:30 |
| K10 | 7h00-17h30 | Ca T7-CN | 07:00 | 17:30 |
| K09 | 6h30-16h30 | Ca T7-CN | 06:30 | 16:30 |
| K35 | 5h00-12h00 | Nghỉ chiều | 05:00 | 12:00 |
| K36 | 5h30-12h00 | Nghỉ chiều | 05:30 | 12:00 |
| K37 | 6h00-12h00 | Nghỉ chiều | 06:00 | 12:00 |
| K39 | 7h30-12h00 | Nghỉ chiều | 07:30 | 12:00 |
| 2K44 | 6h30-12h00 | Nghỉ chiều | 06:30 | 12:00 |
| 2K36 | 5h30-12h00 | Nghỉ chiều | 05:30 | 12:00 |

Thứ tự trong nhóm Ca T7-CN: K01, K03, K06, K10, K09, 2K43.

### A.3 Địa điểm

**NORMAL (ngày thường) và WEEKEND (T7-CN)** — hai bộ giống hệt nhau, cùng thứ tự:

| # | Tên | Mã | Block |
|---|-----|----|-------|
| 1 | Tầng 1 | K1.1TD | Tầng 1 |
| 2 | Siêu âm | K1.2TDSA | Tầng 2 |
| 3 | Xquang | K1.2TDXQ | Tầng 2 |
| 4 | T3 | K1.3TD | Tầng 3 |
| 5 | 3A | K1.3TM | Tầng 3 |
| 6 | NSTH | K1.3TH | Tầng 3 |
| 7 | P322 | K1.P322 | Tầng 3 |
| 8 | P323 | K1.P323 | Tầng 3 |
| 9 | T4 | K1.4TD | Tầng 4 |
| 10 | 4A | K1.401406 | Tầng 4 |
| 11 | 4B | K1.407412 | Tầng 4 |
| 12 | 4CD | K1.414417 | Tầng 4 |
| 13 | 4CD | K1.418423 | Tầng 4 |
| 14 | P430 | K1.P430 | Tầng 4 |
| 15 | T5 | K1.5TD | Tầng 5 |
| 16 | 5A | K1.501506 | Tầng 5 |
| 17 | 5B | K1.507512 | Tầng 5 |
| 18 | 5CD | K1.514517 | Tầng 5 |
| 19 | 5CD | K1.518523 | Tầng 5 |
| 20 | P530 | K1.P530 | Tầng 5 |
| 21 | T6 | K1.6TD | Tầng 6 |
| 22 | 6A | K1.601606 | Tầng 6 |
| 23 | 6B | K1.607612 | Tầng 6 |
| 24 | 6CD | K1.614617 | Tầng 6 |
| 25 | 6CD | K1.618623 | Tầng 6 |
| 26 | P630 | K1.P630 | Tầng 6 |
| 27 | Bốt 1 | K1.HDV1 | Quầy thông tin |
| 28 | Nhà P | K1.HDV2 | Tầng 2 nhà P |
| 29 | B1 | K1.BTD | Tầng B1 |
| 30 | 7C | K1.701-706 | Tầng 7 |
| 31 | 7D | K1.707-712 | Tầng 7 |
| 32 | CS2 | CS2 | CS2 |

**EVENING (ca tối):**

| # | Tên | Mã | Block |
|---|-----|----|-------|
| 1 | Siêu âm | K1.2TDSA | Tầng 2 |
| 2 | P321 | K1.P321 | Tầng 3 |
| 3 | 5CD | K1.518523 | Tầng 5 |
| 4 | 7D | K1.707-712 | Tầng 7 |
| 5 | B1 | K1.BTD | Tầng B1 |

**Ưu tiên block (seed `blocks.priority`):**
- EVENING: Tầng 2 → 1, Tầng 3 → 2, Tầng 5 → 3, Tầng 7 → 4, Tầng B1 → 5.
- WEEKEND: Tầng 1 → 1, Tầng 2 → 2, Tầng 3 → 3, Tầng 4 → 4, Tầng 5 → 5, Tầng 6 → 6, Quầy thông tin → 7,
  Tầng 2 nhà P → 8, Tầng B1 → 9, Tầng 7 → 10, CS2 → 11.
- Không có địa điểm → sau cùng.

---

## Phụ lục B — Bản đồ code v1 (tham khảo khi cần đối chiếu)

| Nội dung | File v1 |
|----------|---------|
| Kiểu dữ liệu | `lib/types/attendance.ts` |
| Danh mục | `lib/constants/{employees,shifts,off-types,work-locations}.ts` |
| Quy tắc nhập liệu | `stores/attendance-store.ts` |
| Chuẩn hóa/migrate payload | `lib/storage/normalize-persisted-payload.ts` |
| Đồng bộ Firestore | `lib/storage/firestore-*.ts`, `hooks/use-attendance-hydrated.ts` |
| Tạo dòng export | `lib/export/build-*-rows.ts` |
| Điền Excel | `lib/export/fill-*-workbook.ts`, `lib/export/*-constants.ts`, `lib/export/format*.ts` |
| Tiện ích tuần | `lib/utils/week.ts` |
| Tìm kiếm nhân viên | `lib/utils/filter-employees.ts` |
| UI | `components/attendance/*` |
| Template Excel | `public/templates/*.xlsx` |
