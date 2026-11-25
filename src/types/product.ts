export const categories = [
  "Eletrônicos",
  "Informática",
  "Eletrodomésticos",
  "Móveis",
  "Ferramentas",
  "Outros",
] as const

export type Category = (typeof categories)[number]
export type WarrantyStatus = "active" | "expiring" | "expired"

export const warrantyStatusLabels: Record<WarrantyStatus, string> = {
  active: "Ativa",
  expiring: "Próxima do vencimento",
  expired: "Expirada",
}

export type Receipt = {
  name: string
  mimeType: string
  size: number
}

export type ProductInput = {
  name: string
  brand?: string
  category: Category
  purchaseDate: string
  purchasePrice?: number
  store?: string
  warrantyMonths: number
}

export const productVersionHeader = "X-Product-Version"

export type Product = ProductInput & {
  id: string
  version: number
  receipt?: Receipt
  createdAt: string
  updatedAt: string
}
