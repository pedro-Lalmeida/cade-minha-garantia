"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RequestError } from "@/services/products"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  function handleSessionError(error: unknown) {
    if (error instanceof RequestError && error.status === 401) {
      router.replace("/login?expirada=1")
      router.refresh()
    }
  }
  const [client] = useState(() => new QueryClient({
    queryCache: new QueryCache({ onError: handleSessionError }),
    mutationCache: new MutationCache({ onError: handleSessionError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => failureCount < 1 &&
          (!(error instanceof RequestError) || error.status === 0 || error.status >= 500),
      },
    },
  }))
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
