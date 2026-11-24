import type { ZodError } from "zod"
import { getSession } from "./auth"

export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly fields?: Record<string, string[] | undefined>) {
    super(message)
  }
}

export function invalidFields(error: ZodError) {
  return new ApiError(422, "Confira os campos indicados.", error.flatten().fieldErrors)
}

export function privateJson<T>(data: T, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } })
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) return privateJson({ message: error.message, fields: error.fields }, error.status)
  console.error("[api] Falha ao completar a solicitação.")
  return privateJson({ message: "Não foi possível concluir a operação. Tente novamente." }, 500)
}

export async function apiUserId() {
  const session = await getSession()
  if (!session?.user.id) throw new ApiError(401, "Sua sessão expirou. Entre novamente para continuar.")
  return session.user.id
}

export function checkRequestOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new ApiError(403, "Origem da solicitação não permitida.")
  }
  const origin = request.headers.get("origin")
  if (!origin) return
  const { protocol } = new URL(request.url)
  const host = request.headers.get("host")
  const expected = host ? `${protocol}//${host}` : new URL(request.url).origin
  const configured = process.env.NEXTAUTH_URL
  if (origin !== expected && (!configured || origin !== new URL(configured).origin)) {
    throw new ApiError(403, "Origem da solicitação não permitida.")
  }
}
