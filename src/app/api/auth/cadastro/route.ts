import { hash } from "bcryptjs"
import { checkRequestOrigin, handleApiError, invalidFields, privateJson } from "@/lib/api"
import { authClientAddress, authRateLimitMessage, authRetryAfter, isDuplicateKey } from "@/lib/auth-rate-limit"
import { UserModel } from "@/models/user"
import { registerSchema } from "@/validations/auth"

function limited(seconds: number) {
  const response = privateJson({ message: authRateLimitMessage }, 429)
  response.headers.set("Retry-After", String(seconds))
  return response
}

export async function POST(request: Request) {
  try {
    checkRequestOrigin(request)
  } catch (error) {
    return handleApiError(error)
  }

  try {
    const ipWait = await authRetryAfter("registerIp", authClientAddress(request.headers))
    if (ipWait) return limited(ipWait)

    const parsed = registerSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return handleApiError(invalidFields(parsed.error))
    const { name, email, password } = parsed.data

    const emailWait = await authRetryAfter("registerEmail", email)
    if (emailWait) return limited(emailWait)

    await UserModel.init()
    const passwordHash = await hash(password, 12)
    try {
      await UserModel.create({ name, email, passwordHash })
    } catch (error) {
      if (!isDuplicateKey(error)) throw error
    }
    return privateJson({ message: "Solicitação processada. Você pode tentar entrar com seu e-mail e senha." }, 202)
  } catch {
    console.error("[auth] Cadastro temporariamente indisponível.")
    return privateJson({ message: "Não foi possível processar o cadastro agora. Tente novamente." }, 503)
  }
}
