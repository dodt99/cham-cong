import type { Employee } from "@/lib/constants/employees";

function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterEmployeesByQuery(
  employees: readonly Employee[],
  query: string,
): Employee[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [...employees];

  return employees.filter((employee) => {
    const haystack = normalizeSearchText(`${employee.id} ${employee.fullName}`);
    return haystack.includes(normalizedQuery);
  });
}
