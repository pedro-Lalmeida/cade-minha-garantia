import { productVersionHeader, type Product, type ProductInput } from "@/types/product"

type ErrorResponse = { message?: string; fields?: Record<string, string[] | undefined> }

export class RequestError extends Error {
  constructor(readonly status: number, readonly details: ErrorResponse) {
    super(details.message ?? (status === 413 ? "O comprovante deve ter até 4 MB." : "Não foi possível concluir a operação."))
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { ...init, cache: "no-store" })
  } catch (error) {
    if (init?.signal?.aborted) throw error
    throw new RequestError(0, { message: "Falha de conexão. Tente novamente." })
  }
  if (!response.ok) {
    const details: ErrorResponse = await response.json().catch(() => ({}))
    throw new RequestError(response.status, details)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

function productUrl(id: string) {
  return `/api/produtos/${encodeURIComponent(id)}`
}

export function receiptUrl(id: string, download = false) {
  return `${productUrl(id)}/comprovante${download ? "?download=1" : ""}`
}

export function listProducts(signal?: AbortSignal) {
  return request<Product[]>("/api/produtos", { signal })
}

export function getProduct(id: string, signal?: AbortSignal) {
  return request<Product>(productUrl(id), { signal })
}

type SaveProductInput = {
  fields: ProductInput
  receipt?: File
  removeReceipt?: boolean
} & ({ id: string; version: number } | { id?: undefined; version?: undefined })

export function saveProduct({ id, version, fields, receipt, removeReceipt }: SaveProductInput) {
  const body = new FormData()
  body.set("product", JSON.stringify(fields))
  if (receipt) body.set("receipt", receipt)
  if (removeReceipt) body.set("removeReceipt", "true")
  if (id === undefined) return request<Product>("/api/produtos", { method: "POST", body })
  return request<Product>(productUrl(id), {
    method: "PATCH", headers: { [productVersionHeader]: String(version) }, body,
  })
}

export function deleteProduct(id: string) {
  return request<void>(productUrl(id), { method: "DELETE" })
}
