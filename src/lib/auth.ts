import { cache } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { getServerSession, type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { UserModel } from "@/models/user"
import { loginSchema } from "@/validations/auth"
import { authRetryAfter } from "./auth-rate-limit"

// A comparação tem o mesmo custo para e-mails cadastrados e desconhecidos.
const dummyHash = "$2b$12$uUlO2TFf3Y7BJSCvJiUT2O1BWDHjuWFJQirvqVrYrtM1902L2YEiK"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "E-mail e senha",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null
        let wait: number
        try {
          wait = await authRetryAfter("loginEmail", parsed.data.email)
        } catch {
          console.error("[auth] Controle de tentativas por e-mail indisponível.")
          throw new Error("LoginIndisponivel")
        }
        if (wait) throw new Error("LimiteAutenticacao")

        try {
          const user = await UserModel.findOne({ email: parsed.data.email }).select("+passwordHash").lean()
          const valid = await compare(parsed.data.password, user?.passwordHash ?? dummyHash)
          if (!user || !valid) return null
          return { id: user._id.toString(), name: user.name, email: user.email }
        } catch {
          console.error("[auth] Falha ao verificar credenciais.")
          throw new Error("LoginIndisponivel")
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
}

export const getSession = cache(async () => {
  await connection()
  return getServerSession(authOptions)
})

export async function requireUser() {
  const session = await getSession()
  if (!session?.user.id) redirect("/login")
  return session.user
}
