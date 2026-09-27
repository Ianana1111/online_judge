import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  });
}

// Auth transitions and browser consumers must clear the same browser cache.
export const queryClient = createQueryClient();

/** Never share SSR query data between requests or seed a new page from an old render. */
export function getQueryClient() {
  return typeof window === "undefined" ? createQueryClient() : queryClient;
}
