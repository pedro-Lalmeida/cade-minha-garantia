import type { Category, Product, WarrantyStatus } from "../types/product.ts"
import { calendarDate, warrantyInfo } from "./warranty.ts"

type Filters = { search: string; category: Category | ""; status: WarrantyStatus | "" }

function searchText(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim()
}

export function productsWithWarranty(products: Product[], today = calendarDate()) {
  return products.map((product) => ({ product, warranty: warrantyInfo(product.purchaseDate, product.warrantyMonths, today) }))
}

export type ProductWithWarranty = ReturnType<typeof productsWithWarranty>[number]

export function filterProducts(products: ProductWithWarranty[], { search, category, status }: Filters) {
  const term = searchText(search)
  return products.filter(({ product, warranty }) => (
    (!term || searchText(product.name).includes(term)) &&
    (!category || product.category === category) &&
    (!status || warranty.status === status)
  ))
}
