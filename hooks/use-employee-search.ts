"use client";

import { useMemo, useState } from "react";

import { EMPLOYEES } from "@/lib/constants/employees";
import { filterEmployeesByQuery } from "@/lib/utils/filter-employees";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

const EMPLOYEE_SEARCH_DEBOUNCE_MS = 300;

export function useEmployeeSearch(debounceMs = EMPLOYEE_SEARCH_DEBOUNCE_MS) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedQuery = useDebouncedValue(searchInput, debounceMs);
  const filteredEmployees = useMemo(
    () => filterEmployeesByQuery(EMPLOYEES, debouncedQuery),
    [debouncedQuery],
  );

  return {
    searchInput,
    setSearchInput,
    filteredEmployees,
  };
}
