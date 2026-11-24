import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { NewProductLink } from "@/components/shared/new-product-link"
import { requireUser } from "@/lib/auth"

export const metadata = { title: "Visão geral" }

export default async function DashboardPage() {
  const user = await requireUser()
  const firstName = user.name?.trim().split(/\s+/)[0]
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{firstName ? `Olá, ${firstName}` : "Olá"}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Veja a situação das garantias dos seus produtos.</p>
        </div>
        <NewProductLink />
      </div>
      <DashboardOverview />
    </div>
  )
}
