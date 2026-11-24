"use client"

import Link from "next/link"
import { Archive, CalendarClock, CircleCheck, Clock3, Package, ShieldOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ContentSkeleton } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { QueryError } from "@/components/shared/query-error"
import { CategoryIcon } from "@/components/products/category-icon"
import { WarrantyBadge } from "@/components/products/warranty-badge"
import { useProducts } from "@/hooks/use-products"
import { productsWithWarranty } from "@/lib/product-view"
import { formatDate } from "@/lib/format"

export function DashboardOverview() {
  const query = useProducts()
  if (query.isPending) return <ContentSkeleton />
  if (query.isError) return <QueryError error={query.error} retry={() => void query.refetch()} />

  const products = productsWithWarranty(query.data)
  const counts = { active: 0, expiring: 0, expired: 0 }
  for (const { warranty } of products) counts[warranty.status]++
  const expiring = products.filter(({ warranty }) => warranty.status === "expiring")
    .sort((a, b) => a.warranty.days - b.warranty.days)
  const metrics = [
    { label: "Total de produtos", number: products.length, icon: Package, color: "text-primary bg-secondary" },
    { label: "Garantias ativas", number: counts.active, icon: CircleCheck, color: "text-primary bg-secondary" },
    { label: "Próximas do vencimento", number: counts.expiring, icon: Clock3, color: "text-warning bg-warning-surface" },
    { label: "Garantias expiradas", number: counts.expired, icon: Archive, color: "text-muted-foreground bg-muted" },
  ]

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {metrics.map(({ label, number, icon: Icon, color }) => (
          <Card key={label} className="relative min-h-29 gap-2.5 rounded-xl border p-3.5 shadow-none sm:p-4">
            <dt className="flex min-h-8 items-center justify-between gap-1.5 text-xs leading-snug font-medium text-muted-foreground sm:text-sm">
              {label}
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${color}`}>
                <Icon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
            </dt>
            <dd className="text-3xl leading-none font-semibold tracking-tight tabular-nums text-primary">{number}</dd>
          </Card>
        ))}
      </dl>
      <Card className="gap-0 rounded-xl border py-0 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
          <div>
            <h2 className="section-title text-primary">Produtos com vencimento próximo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Garantias que vencem nos próximos 30 dias.</p>
          </div>
          <Link href="/produtos" className="quiet-link py-2 text-sm">Ver todos os produtos</Link>
        </div>
        {expiring.length > 0 ? (
          <ul className="divide-y px-4 sm:px-5">
            {expiring.map(({ product, warranty }) => (
              <li key={product.id}>
                <Link href={`/produtos/${product.id}`} className="-mx-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-2 py-3 hover:bg-muted sm:flex-nowrap">
                  <CategoryIcon category={product.category} />
                  <div className="min-w-0 flex-1 basis-36">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{product.brand || product.category}</p>
                  </div>
                  <WarrantyBadge status={warranty.status} today={warranty.days === 0} />
                  <time className="text-sm font-medium tabular-nums text-primary sm:ml-2" dateTime={warranty.end}>{formatDate(warranty.end)}</time>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={products.length ? CalendarClock : ShieldOff}
            title={products.length ? "Nenhuma garantia perto de vencer" : "Seus produtos aparecem aqui"}
            description={products.length ? "Você não tem garantias com vencimento nos próximos 30 dias." : "Cadastre seu primeiro produto para começar a acompanhar suas garantias."}
          />
        )}
      </Card>
    </div>
  )
}
