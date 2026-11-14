# Chấm công HDV

Xếp ca theo tuần cho đội Hướng dẫn viên và xuất 4 file Excel (Fast, Làm sớm, Làm tối, T7-CN).

| Thư mục | Nội dung |
|---------|----------|
| `backend/` | Spring Boot · PostgreSQL (Flyway) · xuất Excel bằng Apache POI |
| `frontend/` | Next.js |
| `deploy/`, `docker-compose.yml` | Đóng gói triển khai: Postgres + backend + frontend sau Caddy |
| `docs/` | [`V2_DESIGN.md`](docs/V2_DESIGN.md) (thiết kế) · [`BUSINESS_SPEC.md`](docs/BUSINESS_SPEC.md) (nghiệp vụ và định dạng từng file Excel) |

Bản v1 (Next.js tĩnh + Firestore) nằm ở nhánh `v1`.

## Chạy bằng Docker Compose

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

## Phát triển

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
`backend/src/test/resources/golden/` và so từng ô của 4 file xuất ra với file chuẩn nằm cạnh `input.json`.

Các file chuẩn này do code v1 sinh ra và giữ cố định để bảo đảm Excel giống v1. Công cụ sinh (`tools/golden`, chạy
bằng code v1) đã được gỡ cùng v1; nếu cần thêm kịch bản thì lấy lại từ commit `8b30318`.
