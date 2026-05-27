"use client";

import { useMemo, useState } from "react";

import type { Employee } from "@/lib/constants/employees";
import { EMPLOYEES } from "@/lib/constants/employees";
import { filterEmployeesByQuery } from "@/lib/utils/filter-employees";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

const EMPLOYEE_SEARCH_DEBOUNCE_MS = 300;

export function useEmployeeSearch(
  employees: Employee[] = EMPLOYEES,
  debounceMs = EMPLOYEE_SEARCH_DEBOUNCE_MS,
) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedQuery = useDebouncedValue(searchInput, debounceMs);
  const filteredEmployees = useMemo(
    () => filterEmployeesByQuery(employees, debouncedQuery),
    [employees, debouncedQuery],
  );

  return {
    searchInput,
    setSearchInput,
    filteredEmployees,
  };
}
