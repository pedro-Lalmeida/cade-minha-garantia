import { setServers } from "node:dns"
import mongoose from "mongoose"

type MongoCache = { connection?: typeof mongoose; pending?: Promise<typeof mongoose> }
const globalMongo = globalThis as typeof globalThis & { garantiaMongo?: MongoCache }
const cache = globalMongo.garantiaMongo ??= {}

export async function connectMongo() {
  if (cache.connection) return cache.connection

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI ausente.")

  if (!cache.pending) {
    if (process.env.NODE_ENV === "development" && process.env.MONGODB_DEV_DNS) {
      setServers(process.env.MONGODB_DEV_DNS.split(",").map((server) => server.trim()))
    }
    cache.pending = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8_000,
      bufferCommands: false,
    }).catch((error: unknown) => {
      cache.pending = undefined
      throw error
    })
  }

  cache.connection = await cache.pending
  return cache.connection
}
