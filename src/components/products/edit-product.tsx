"use client"

import { useCallback, useEffect, useState } from "react"
import { ContentSkeleton } from "@/components/shared/loading"
import { Problem } from "@/components/shared/problem"
import { QueryError } from "@/components/shared/query-error"
import { useProduct } from "@/hooks/use-products"
import { RequestError } from "@/services/products"
import type { Product } from "@/types/product"
import { ProductFormPage } from "./product-form-page"

export function EditProduct({ product }: { product: Product }) {
  const [original, setOriginal] = useState<Product>()
  const { error, isFetching, refetch } = useProduct(product.id, product, false)

  // A navegação pode reutilizar os dados da página. Abra o formulário com uma leitura nova.
  const loadProduct = useCallback(async () => {
    const { data } = await refetch({ throwOnError: true })
    if (!data) throw new Error("Não foi possível recarregar o produto.")
    return data
  }, [refetch])

  useEffect(() => {
    let active = true
    void loadProduct().then((data) => {
      if (active) setOriginal(data)
    }, () => {
      // A query informa a falha na renderização abaixo.
    })
    return () => { active = false }
  }, [loadProduct])

  async function reload() {
    setOriginal(await loadProduct())
  }

  if (!original) {
    if (isFetching || !error) return <ContentSkeleton />
    if (error instanceof RequestError && error.status === 404) {
      return <div className="grid justify-items-center py-12"><Problem kind="not-found" back="/produtos" /></div>
    }
    return <QueryError error={error} retry={() => void reload().catch(() => {})} />
  }

  return <ProductFormPage product={original} onReload={reload} />
}
