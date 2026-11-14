"use client";

import { useState } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      // Hết phiên ở bất kỳ truy vấn nào → về trang đăng nhập, nhớ đường dẫn để quay lại.
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401 && !location.pathname.startsWith("/login")) {
          location.assign(`/login?next=${encodeURIComponent(location.pathname)}`);
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
        refetchOnWindowFocus: true,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
