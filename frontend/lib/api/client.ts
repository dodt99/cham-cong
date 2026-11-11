import type {
  Assignment,
  BulkMode,
  Catalog,
  CellContent,
  CellRef,
  CurrentUser,
  ExportPreview,
  ExportType,
  WeekView,
} from "@/lib/api/types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: unknown = null,
  ) {
    super(message);
  }
}

const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "X-XSRF-TOKEN";

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** Backend phát cookie XSRF-TOKEN ở lần gọi /api/auth/csrf; mọi request ghi phải gửi lại nó trong header. */
async function csrfToken(): Promise<string> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  await fetch("/api/auth/csrf", { credentials: "same-origin" });
  return readCookie(CSRF_COOKIE) ?? "";
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (method !== "GET") headers[CSRF_HEADER] = await csrfToken();
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Không kết nối được máy chủ.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      error?.code ?? "HTTP_" + response.status,
      error?.message ?? fallbackMessage(response.status),
      error?.details ?? null,
    );
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

function fallbackMessage(status: number): string {
  if (status === 401) return "Phiên đăng nhập đã hết hạn.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

function query(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) search.set(key, String(value));
  }
  return search.toString();
}

export const api = {
  me: () => request<CurrentUser>("GET", "/api/auth/me"),
  login: (username: string, password: string) =>
    request<CurrentUser>("POST", "/api/auth/login", { username, password }),
  logout: () => request<void>("POST", "/api/auth/logout"),

  catalog: () => request<Catalog>("GET", "/api/catalog"),
  week: (weekStart: string) => request<WeekView>("GET", `/api/schedule?${query({ weekStart })}`),

  /** `version`: phiên bản đang thấy của ô, null nếu ô đang trống. */
  putCell: (cell: CellRef, content: CellContent, version: number | null) =>
    request<Assignment>("PUT", "/api/assignments", { ...cell, ...content, version }),
  deleteCell: (cell: CellRef, version: number | null) =>
    request<void>("DELETE", `/api/assignments?${query({ ...cell, version })}`),
  applyToWeekdays: (employeeId: number, weekStart: string, content: CellContent, mode: BulkMode) =>
    request<Assignment[]>("POST", "/api/assignments/bulk", { employeeId, weekStart, ...content, mode }),

  exportPreview: (type: ExportType, weekStart: string) =>
    request<ExportPreview>("GET", `/api/exports/${type}/preview?${query({ weekStart })}`),
  exportFileUrl: (type: ExportType, weekStart: string) =>
    `/api/exports/${type}/file?${query({ weekStart })}`,
};
