"use client"

import { Package, SearchX } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { filterProducts, productsWithWarranty } from "@/lib/product-view"
import { useUI } from "@/store/ui"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ContentSkeleton } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { NewProductLink } from "@/components/shared/new-product-link"
import { QueryError } from "@/components/shared/query-error"
import { ProductFilters } from "./product-filters"
import { ProductRow, productColumns } from "./product-row"

export function ProductList() {
  const query = useProducts()
  const search = useUI((state) => state.search)
  const category = useUI((state) => state.category)
  const status = useUI((state) => state.status)
  const reset = useUI((state) => state.resetFilters)

  if (query.isPending) return <ContentSkeleton />
  if (query.isError) return <QueryError error={query.error} retry={() => void query.refetch()} />
  const filtered = filterProducts(productsWithWarranty(query.data), { search, category, status })

  return (
    <div className="space-y-4">
      <ProductFilters />
      <Card className="gap-0 rounded-xl border py-0 shadow-none">
        {query.data.length === 0 ? (
          <EmptyState icon={Package} title="Você ainda não tem produtos" description="Cadastre um produto para guardar seu comprovante e acompanhar a garantia." action={<NewProductLink />} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="Nenhum produto encontrado" description="Busque por outro nome ou ajuste os filtros." action={<Button variant="outline" className="h-11" onClick={reset}>Limpar filtros</Button>} />
        ) : (
          <>
            <div aria-hidden="true" className={`hidden gap-3 border-b bg-muted/50 px-5 py-3 text-xs font-semibold text-muted-foreground xl:grid ${productColumns}`}>
              <span>Produto</span><span>Categoria</span><span>Compra</span><span>Garantia</span><span className="text-right">Ações</span>
            </div>
            <ul aria-label="Produtos cadastrados" className="divide-y">
              {filtered.map((entry) => <ProductRow key={entry.product.id} {...entry} />)}
            </ul>
          </>
        )}
      </Card>
      {query.data.length > 0 && <p role="status" className="text-xs text-muted-foreground">
        {filtered.length === 1 ? "1 produto encontrado" : `${filtered.length} produtos encontrados`}
      </p>}
    </div>
  )
}
