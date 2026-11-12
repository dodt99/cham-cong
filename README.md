# Chấm công HDV

Xếp ca theo tuần cho đội Hướng dẫn viên và xuất 4 file Excel (Fast, Làm sớm, Làm tối, T7-CN).

Repo đang chứa hai phiên bản song song:

| | Vị trí | Công nghệ |
|--|--------|-----------|
| **v2** | `backend/`, `frontend/`, `docker-compose.yml` | Spring Boot · Next.js · PostgreSQL |
| **v1** (đang chạy thật cho tới khi chuyển sang v2) | gốc repo: `app/`, `components/`, `lib/`, `stores/` | Next.js tĩnh + Firestore |

Tài liệu: [`docs/V2_DESIGN.md`](docs/V2_DESIGN.md) (thiết kế v2) · [`docs/BUSINESS_SPEC.md`](docs/BUSINESS_SPEC.md) (nghiệp vụ và định dạng từng file Excel).

## Chạy v2 bằng Docker Compose

```bash
cp .env.example .env
```

Sửa mật khẩu trong `.env`, rồi:

```bash
docker compose up -d --build
```

Mở `http://localhost` và đăng nhập bằng `APP_ADMIN_USERNAME` / `APP_ADMIN_PASSWORD`. Tài khoản này chỉ được tạo ở
lần chạy đầu, khi hệ thống chưa có người dùng nào. Đặt `SITE_ADDRESS` thành tên miền để Caddy tự cấp HTTPS.
Tài khoản khác, nhân viên, ca và địa điểm được thêm / sửa ở trang **Quản trị** (chỉ quyền admin).

Dữ liệu nằm trong volume `db-data`; nên đặt lịch `pg_dump` hằng ngày.

## Phát triển v2

Cần Java 21, Maven, Node 22 và Docker (cho Postgres và cho test).

```bash
docker run -d --name chamcong-db -e POSTGRES_DB=chamcong -e POSTGRES_USER=chamcong -e POSTGRES_PASSWORD=chamcong -p 5432:5432 postgres:16-alpine
```

```bash
cd backend && APP_ADMIN_USERNAME=admin APP_ADMIN_PASSWORD=doi-mat-khau mvn spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

Frontend chạy ở `http://localhost:3000` và chuyển tiếp `/api` sang backend (`BACKEND_URL`, mặc định `http://localhost:8080`).

### Test

```bash
cd backend && mvn test
```

```bash
cd frontend && npm test
```

Test backend dùng Testcontainers nên cần Docker đang chạy. `ExportGoldenTest` nạp từng kịch bản trong
`backend/src/test/resources/golden/` và so từng ô của 4 file xuất ra với file do **code v1** sinh.

### Sinh lại file chuẩn từ v1

Chỉ cần khi thêm kịch bản mới (thêm thư mục chứa `input.json` viết theo mô hình dữ liệu v1):

```bash
npm install && npm run golden
```

## v1

```bash
npm install && npm run dev
```

`npm run deploy` build tĩnh và đưa lên Firebase Hosting. Code v1 sẽ được gỡ khỏi gốc repo sau khi chuyển hẳn sang v2.
