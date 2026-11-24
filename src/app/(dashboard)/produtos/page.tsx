import { ProductList } from "@/components/products/product-list"
import { NewProductLink } from "@/components/shared/new-product-link"
import { requireUser } from "@/lib/auth"

export const metadata = { title: "Meus produtos" }

export default async function ProductsPage() {
  await requireUser()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Meus produtos</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Consulte seus produtos, garantias e comprovantes.</p>
        </div>
        <NewProductLink>Novo produto</NewProductLink>
      </div>
      <ProductList />
    </div>
  )
}
