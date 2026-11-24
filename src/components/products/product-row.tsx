import Link from "next/link"
import { Paperclip } from "lucide-react"
import { formatDate, formatPrice } from "@/lib/format"
import { daysRemaining } from "@/lib/warranty"
import type { ProductWithWarranty } from "@/lib/product-view"
import { CategoryIcon } from "./category-icon"
import { ProductActions } from "./product-actions"
import { WarrantyBadge } from "./warranty-badge"

export const productColumns = "xl:grid-cols-[minmax(0,1.5fr)_minmax(0,.95fr)_minmax(0,1fr)_minmax(0,1.25fr)_9rem]"

export function ProductRow({ product, warranty }: ProductWithWarranty) {
  return (
    <li className={`grid grid-cols-2 items-center gap-x-3 gap-y-3 px-4 py-3.5 transition-colors hover:bg-muted/35 sm:px-5 ${productColumns}`}>
      <div className="col-span-2 flex min-w-0 items-center gap-2.5 xl:col-span-1">
        <CategoryIcon category={product.category} />
        <div className="min-w-0">
          <Link href={`/produtos/${product.id}`} className="block rounded-sm text-sm font-semibold wrap-anywhere hover:text-primary hover:underline">
            {product.name}
          </Link>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {product.brand && <span className="wrap-anywhere">{product.brand}</span>}
            {product.receipt && <span className="inline-flex items-center gap-1"><Paperclip className="size-3" aria-hidden="true" />Comprovante</span>}
          </p>
        </div>
      </div>
      <div className="min-w-0 text-sm wrap-anywhere">
        <p className="text-xs text-muted-foreground xl:hidden">Categoria</p>
        {product.category}
      </div>
      <div className="min-w-0 text-sm tabular-nums">
        <p className="text-xs text-muted-foreground xl:hidden">Compra</p>
        <time dateTime={product.purchaseDate}>{formatDate(product.purchaseDate)}</time>
        {product.purchasePrice !== undefined && <p className="mt-0.5 text-xs text-muted-foreground">{formatPrice(product.purchasePrice)}</p>}
      </div>
      <div className="col-span-2 grid justify-items-start gap-1 xl:col-span-1">
        <WarrantyBadge status={warranty.status} today={warranty.days === 0} />
        <p className="text-xs text-muted-foreground">
          <time dateTime={warranty.end}>{formatDate(warranty.end)}</time>
          {warranty.days !== 0 && <> · {daysRemaining(warranty.days)}</>}
        </p>
      </div>
      <div className="-ml-2 col-span-2 xl:col-span-1 xl:ml-0"><ProductActions product={product} compact /></div>
    </li>
  )
}
