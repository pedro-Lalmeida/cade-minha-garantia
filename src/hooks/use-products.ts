"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteProduct, getProduct, listProducts, saveProduct } from "@/services/products"
import type { Product } from "@/types/product"

const listKey = ["products", "list"] as const
const productKey = (id: string) => ["products", "detail", id] as const

export function useProducts() {
  return useQuery({ queryKey: listKey, queryFn: ({ signal }) => listProducts(signal) })
}

export function useProduct(id: string, initialData?: Product) {
  return useQuery({ queryKey: productKey(id), queryFn: ({ signal }) => getProduct(id, signal), initialData })
}

export function useSaveProduct() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: saveProduct,
    async onSuccess(product) {
      await client.cancelQueries({ queryKey: productKey(product.id) })
      client.setQueryData(productKey(product.id), product)
      await client.invalidateQueries({ queryKey: listKey })
    },
  })
}

export function useDeleteProduct() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    async onSuccess(_result, id) {
      await client.cancelQueries({ queryKey: productKey(id) })
      client.removeQueries({ queryKey: productKey(id) })
      await client.invalidateQueries({ queryKey: listKey })
    },
  })
}
