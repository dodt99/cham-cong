import type { Member } from "@/lib/api/types";

/** Bỏ dấu tiếng Việt (kể cả đ/Đ) và viết thường để tìm kiếm không dấu. */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/** Lọc theo mã NV hoặc họ tên, không phân biệt dấu và hoa thường. */
export function filterMembers(members: readonly Member[], search: string): Member[] {
  const needle = normalizeSearchText(search);
  if (!needle) return [...members];
  return members.filter((member) =>
    normalizeSearchText(`${member.code} ${member.fullName}`).includes(needle),
  );
}

/**
 * Bộ lọc cho các ô chọn có tìm kiếm (cmdk): so khớp không dấu trên `value` của từng mục,
 * nên gõ "sieu am" vẫn ra "Siêu âm". `value` của mục phải được tạo bằng {@link searchValue}.
 */
export function matchesSearch(itemValue: string, search: string): number {
  return itemValue.includes(normalizeSearchText(search)) ? 1 : 0;
}

export function searchValue(...parts: string[]): string {
  return normalizeSearchText(parts.join(" "));
}
