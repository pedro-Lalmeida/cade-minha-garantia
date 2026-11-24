import { Suspense } from "react"
import { redirect } from "next/navigation"
import { PublicFrame } from "@/components/shared/public-frame"
import { getSession } from "@/lib/auth"

async function GuestOnly({ children }: { children: React.ReactNode }) {
  if ((await getSession())?.user.id) redirect("/dashboard")
  return children
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicFrame>
      <Suspense fallback={<div className="h-80 w-full max-w-[26rem] animate-pulse rounded-xl border bg-card" role="status" aria-label="Carregando formulário" />}>
        <GuestOnly>{children}</GuestOnly>
      </Suspense>
    </PublicFrame>
  )
}
