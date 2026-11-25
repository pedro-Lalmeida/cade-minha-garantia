import { setServers } from "node:dns"
import mongoose from "mongoose"

type MongoCache = { connection?: typeof mongoose; pending?: Promise<typeof mongoose> }
const globalMongo = globalThis as typeof globalThis & { garantiaMongo?: MongoCache }
const cache = globalMongo.garantiaMongo ??= {}

function connectionCategory(error: unknown): string {
  if (typeof error !== "object" || error === null) return "falha desconhecida"
  if ("syscall" in error && (error.syscall === "querySrv" || error.syscall === "queryTxt")) {
    return "resolução DNS do Atlas"
  }
  if ("code" in error) {
    const code = error.code
    if (code === 18 || code === 8000) return "autenticação ou autorização no Atlas"
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "resolução DNS do Atlas"
    if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ECONNRESET") return "rede ou acesso ao Atlas"
    if (typeof code === "string" && /^(?:ERR_TLS_|ERR_SSL_|CERT_|UNABLE_TO_VERIFY_)/.test(code)) return "negociação TLS"
  }
  if (error instanceof mongoose.mongo.MongoParseError) return "configuração da conexão inválida"
  if (error instanceof mongoose.mongo.MongoServerSelectionError) {
    const cause = connectionCategory(error.cause)
    if (cause !== "falha desconhecida") return cause
    return "nenhum servidor selecionado no prazo"
  }
  return "falha desconhecida"
}

async function openMongo() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("[mongodb] Conexão indisponível: configuração ausente.")
    throw new Error("MongoDB indisponível.")
  }

  if (process.env.NODE_ENV === "development" && process.env.MONGODB_DEV_DNS) {
    try {
      setServers(process.env.MONGODB_DEV_DNS.split(",").map((server) => server.trim()))
    } catch {
      console.error("[mongodb] Conexão indisponível: DNS de desenvolvimento inválido.")
      throw new Error("MongoDB indisponível.")
    }
  }

  try {
    return await mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8_000,
      bufferCommands: false,
    })
  } catch (error) {
    console.error(`[mongodb] Conexão indisponível: ${connectionCategory(error)}.`)
    throw new Error("MongoDB indisponível.")
  }
}

export async function connectMongo() {
  if (cache.connection) return cache.connection
  cache.pending ??= openMongo().catch((error: unknown) => {
    cache.pending = undefined
    throw error
  })
  cache.connection = await cache.pending
  return cache.connection
}
