import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata = { title: "Entrar" }

type Props = { searchParams: Promise<{ expirada?: string; cadastro?: string }> }

async function LoginContent({ searchParams }: Props) {
  const { expirada, cadastro } = await searchParams
  return (
    <div className="grid w-full max-w-[26rem] gap-3">
      {cadastro === "1" && <p role="status" className="rounded-lg bg-secondary p-3 text-sm text-primary">Solicitação processada. Tente entrar com seu e-mail e senha.</p>}
      <AuthForm mode="login" expired={expirada === "1"} />
    </div>
  )
}

export default function LoginPage(props: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full max-w-[26rem] rounded-xl border bg-card" />}>
      <LoginContent {...props} />
    </Suspense>
  )
}
