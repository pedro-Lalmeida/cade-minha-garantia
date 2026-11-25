import { createHmac } from "node:crypto"
import { isIP } from "node:net"
import { model, models, Schema, type Model } from "mongoose"
import { connectMongo } from "./mongodb"

const windowMs = 15 * 60 * 1000
const limits = { loginIp: 30, loginEmail: 10, registerIp: 8, registerEmail: 4 } as const
type Scope = keyof typeof limits
type Counter = { _id: string; attempts: number; expiresAt: Date }

const schema = new Schema<Counter>({
  _id: { type: String, required: true },
  attempts: { type: Number, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { collection: "auth_rate_limits", versionKey: false })
const CounterModel = (models.AuthRateLimit as Model<Counter> | undefined) ?? model<Counter>("AuthRateLimit", schema)

export function authClientAddress(headers: Headers) {
  const address = process.env.VERCEL === "1" ? headers.get("x-vercel-forwarded-for")?.trim() : undefined
  return address && isIP(address) ? address.toLowerCase() : "shared"
}

export async function authRetryAfter(scope: Scope, identifier: string) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("Proteção de autenticação indisponível.")
  const now = Date.now()
  const end = (Math.floor(now / windowMs) + 1) * windowMs
  const _id = createHmac("sha256", secret).update(JSON.stringify([scope, identifier, end])).digest("hex")
  const increment = { $inc: { attempts: 1 }, $setOnInsert: { expiresAt: new Date(end) } }

  await connectMongo()
  await CounterModel.init()
  let counter: Counter | null
  try {
    counter = await CounterModel.findOneAndUpdate({ _id }, increment, { upsert: true, returnDocument: "after" }).lean()
  } catch (error) {
    // Outra instância pode ter inserido o contador da janela primeiro.
    if (!isDuplicateKey(error)) throw error
    counter = await CounterModel.findOneAndUpdate({ _id }, increment, { returnDocument: "after" }).lean()
  }
  if (!counter) throw new Error("Contador de autenticação indisponível.")
  return counter.attempts > limits[scope] ? Math.max(1, Math.ceil((end - Date.now()) / 1000)) : 0
}

export function isDuplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000
}

export const authRateLimitMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente."
