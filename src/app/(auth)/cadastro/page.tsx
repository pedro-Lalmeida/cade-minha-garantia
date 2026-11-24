import { AuthForm } from "@/components/auth/auth-form"

export const metadata = { title: "Criar conta" }

export default function RegisterPage() {
  return <AuthForm mode="register" />
}
