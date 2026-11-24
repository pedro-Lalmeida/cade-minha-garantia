import NextAuth from "next-auth"
import { connection, type NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"

const nextAuth = NextAuth(authOptions)

async function handler(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  await connection()
  return nextAuth(request, context)
}

export { handler as GET, handler as POST }
