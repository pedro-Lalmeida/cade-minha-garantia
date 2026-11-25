import NextAuth from "next-auth"
import { connection, type NextRequest } from "next/server"
import { checkRequestOrigin, handleApiError, privateJson } from "@/lib/api"
import { authOptions } from "@/lib/auth"
import { authClientAddress, authRetryAfter } from "@/lib/auth-rate-limit"

const nextAuth = NextAuth(authOptions)

function loginError(request: Request, code: string, status: number, retryAfter?: number) {
  const url = new URL("/login", request.url)
  url.searchParams.set("error", code)
  const response = privateJson({ url: url.href }, status)
  if (retryAfter) response.headers.set("Retry-After", String(retryAfter))
  return response
}

async function handler(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  await connection()
  const { nextauth: [action, provider] } = await context.params
  if (request.method === "POST" && action === "callback" && provider === "credentials") {
    try {
      checkRequestOrigin(request)
    } catch (error) {
      return handleApiError(error)
    }

    try {
      const wait = await authRetryAfter("loginIp", authClientAddress(request.headers))
      if (wait) return loginError(request, "LimiteAutenticacao", 429, wait)
    } catch {
      console.error("[auth] Controle de tentativas de login indisponível.")
      return loginError(request, "LoginIndisponivel", 503)
    }
  }
  return nextAuth(request, context)
}

export { handler as GET, handler as POST }
