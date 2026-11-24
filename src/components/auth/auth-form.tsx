"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/shared/form-field"
import { loginSchema, registerSchema } from "@/validations/auth"
import { PasswordInput } from "./password-input"

type FieldErrors = Record<string, string[] | undefined>

export function AuthForm({ mode, expired = false }: { mode: "login" | "register"; expired?: boolean }) {
  const registration = mode === "register"
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setMessage("")
    const parsed = (registration ? registerSchema : loginSchema).safeParse(data)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      return
    }
    setErrors({})
    setBusy(true)
    try {
      if (registration) {
        const response = await fetch("/api/auth/cadastro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        })
        if (!response.ok) {
          const result: { message?: string; fields?: FieldErrors } = await response.json()
          if (response.status === 409) setErrors({ email: [result.message ?? "E-mail já cadastrado."] })
          else if (result.fields) setErrors(result.fields)
          else setMessage(result.message ?? "Não foi possível criar sua conta.")
          return
        }
      }
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl: "/dashboard",
      })
      if (result?.ok && !result.error) {
        router.replace("/dashboard")
        router.refresh()
      } else if (registration) {
        router.replace("/login?cadastro=1")
      } else {
        setMessage(result?.error === "CredentialsSignin" ? "E-mail ou senha inválidos." : "Não foi possível entrar agora. Tente novamente.")
      }
    } catch {
      setMessage("Não foi possível concluir a operação. Tente novamente.")
    } finally {
      setBusy(false)
    }
  }

  function fieldProps(id: string) {
    return { id, name: id, "aria-invalid": Boolean(errors[id]), "aria-describedby": errors[id] ? `${id}-error` : undefined }
  }

  return (
    <Card className="w-full max-w-[26rem] gap-0 rounded-xl border p-6 shadow-[0_2px_10px_#26382a05] sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {registration ? "Criar uma conta" : "Entrar na sua conta"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {registration ? "Cadastre-se para gerenciar seus produtos e garantias." : "Acesse seus produtos e acompanhe suas garantias."}
        </p>
      </div>
      {expired && <p role="status" className="mb-4 rounded-lg bg-warning-surface p-3 text-sm text-warning">Sua sessão expirou. Entre novamente para continuar.</p>}
      <form onSubmit={submit} noValidate className="space-y-4">
        {registration && (
          <FormField id="name" label="Nome completo" error={errors.name?.[0]}>
            <Input {...fieldProps("name")} autoComplete="name" placeholder="Seu nome" maxLength={100} required className="h-11" />
          </FormField>
        )}
        <FormField id="email" label="E-mail" error={errors.email?.[0]}>
          <Input {...fieldProps("email")} type="email" autoComplete="email" placeholder="voce@exemplo.com" maxLength={254} required className="h-11" />
        </FormField>
        <FormField id="password" label="Senha" error={errors.password?.[0]}>
          <PasswordInput {...fieldProps("password")} autoComplete={registration ? "new-password" : "current-password"} placeholder={registration ? "Mínimo de 8 caracteres" : "Sua senha"} required />
        </FormField>
        {registration && (
          <FormField id="confirmPassword" label="Confirmar senha" error={errors.confirmPassword?.[0]}>
            <PasswordInput {...fieldProps("confirmPassword")} autoComplete="new-password" placeholder="Repita sua senha" required />
          </FormField>
        )}
        {message && <p role="alert" className="rounded-lg bg-expired-surface p-3 text-sm text-destructive">{message}</p>}
        <Button type="submit" disabled={busy} className="mt-1 h-11 w-full">
          {busy && <LoaderCircle className="animate-spin" />}
          {busy ? (registration ? "Criando conta…" : "Entrando…") : (registration ? "Criar conta" : "Entrar")}
        </Button>
      </form>
      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        {registration ? "Já tem uma conta? " : "Ainda não tem conta? "}
        <Link href={registration ? "/login" : "/cadastro"} className="quiet-link">
          {registration ? "Entrar" : "Criar uma conta"}
        </Link>
      </p>
    </Card>
  )
}
