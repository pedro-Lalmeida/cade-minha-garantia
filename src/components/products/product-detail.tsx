"use client"

import { CalendarDays } from "lucide-react"
import { Card } from "@/components/ui/card"
import { BackLink } from "@/components/shared/back-link"
import { ContentSkeleton } from "@/components/shared/loading"
import { Problem } from "@/components/shared/problem"
import { QueryError } from "@/components/shared/query-error"
import { useProduct } from "@/hooks/use-products"
import { formatDate, formatPrice } from "@/lib/format"
import { daysRemaining, warrantyInfo } from "@/lib/warranty"
import { RequestError } from "@/services/products"
import type { Product } from "@/types/product"
import { CategoryIcon } from "./category-icon"
import { ProductActions } from "./product-actions"
import { ReceiptCard } from "./receipt-card"
import { WarrantyBadge, warrantyStyles } from "./warranty-badge"

function DataItem({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold wrap-anywhere">{children ?? "—"}</dd>
    </div>
  )
}

export function ProductDetail({ product }: { product: Product }) {
  const query = useProduct(product.id, product)
  if (query.isPending) return <ContentSkeleton />
  if (query.error instanceof RequestError && query.error.status === 404) {
    return <div className="grid justify-items-center py-12"><Problem kind="not-found" back="/produtos" /></div>
  }
  if (query.isError) return <QueryError error={query.error} retry={() => void query.refetch()} />

  const saved = query.data
  const warranty = warrantyInfo(saved.purchaseDate, saved.warrantyMonths)
  const duration = (Date.parse(warranty.end) - Date.parse(saved.purchaseDate)) / 86_400_000
  const progress = Math.round(Math.max(0, Math.min(1, 1 - warranty.days / duration)) * 100)
  const { Icon, color, bar } = warrantyStyles[warranty.status]
  const durationText = saved.warrantyMonths === 1 ? "1 mês" : `${saved.warrantyMonths} meses`

  return (
    <div className="space-y-5">
      <BackLink href="/produtos">Voltar para Meus produtos</BackLink>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <CategoryIcon category={saved.category} />
          <div className="min-w-0">
            <h1 className="page-title wrap-anywhere">{saved.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{saved.category}</p>
          </div>
        </div>
        <ProductActions product={saved} />
      </div>
      <Card className="grid items-center gap-4 rounded-xl border p-4 shadow-none sm:p-5 xl:grid-cols-[1fr_minmax(12rem,24rem)]">
        <div className="flex items-start gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${color}`}><Icon className="size-5" aria-hidden="true" /></span>
          <div>
            <h2 className="section-title">{daysRemaining(warranty.days)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Vencimento em <time dateTime={warranty.end} className="font-semibold">{formatDate(warranty.end)}</time></p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Prazo decorrido</span>
            <WarrantyBadge status={warranty.status} />
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Prazo de garantia decorrido" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full ${bar}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="h-fit gap-4 rounded-xl border p-4 shadow-none sm:p-5">
          <h2 className="section-title flex items-center gap-2"><CalendarDays className="size-4 text-primary" aria-hidden="true" />Dados da compra</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-t pt-4">
            <DataItem label="Marca">{saved.brand}</DataItem>
            <DataItem label="Categoria">{saved.category}</DataItem>
            <DataItem label="Loja">{saved.store}</DataItem>
            <DataItem label="Data da compra"><time dateTime={saved.purchaseDate}>{formatDate(saved.purchaseDate)}</time></DataItem>
            <DataItem label="Valor da compra">{saved.purchasePrice !== undefined ? formatPrice(saved.purchasePrice) : undefined}</DataItem>
            <DataItem label="Duração da garantia">{durationText}</DataItem>
          </dl>
        </Card>
        <ReceiptCard product={saved} />
      </div>
    </div>
  )
}
