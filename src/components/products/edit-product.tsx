"use client"

import { ProductFormPage } from "./product-form-page"
import { ContentSkeleton } from "@/components/shared/loading"
import { Problem } from "@/components/shared/problem"
import { QueryError } from "@/components/shared/query-error"
import { useProduct } from "@/hooks/use-products"
import { RequestError } from "@/services/products"
import type { Product } from "@/types/product"

export function EditProduct({ product }: { product: Product }) {
  const query = useProduct(product.id, product)
  if (query.isPending) return <ContentSkeleton />
  if (query.error instanceof RequestError && query.error.status === 404) {
    return <div className="grid justify-items-center py-12"><Problem kind="not-found" back="/produtos" /></div>
  }
  if (query.isError) return <QueryError error={query.error} retry={() => void query.refetch()} />
  return <ProductFormPage product={query.data} />
}
