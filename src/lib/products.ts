import { ProductModel, type ProductRecord } from "@/models/product"
import type { Product } from "@/types/product"
import { isProductId } from "@/validations/product"
import { ApiError } from "./api"
import { connectMongo } from "./mongodb"

export function productScope(userId: string, id: string) {
  if (!isProductId(id)) throw new ApiError(400, "Identificador de produto inválido.")
  return { _id: id, userId }
}

export function productDto(product: Omit<ProductRecord, "receiptContent">): Product {
  const { _id, name, brand, category, purchaseDate, purchasePrice, store, warrantyMonths, receipt, createdAt, updatedAt } = product
  return {
    id: _id.toString(),
    name, brand, category, purchasePrice, store, warrantyMonths,
    purchaseDate: purchaseDate.toISOString().slice(0, 10),
    receipt: receipt && { name: receipt.name, mimeType: receipt.mimeType, size: receipt.size },
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }
}

export async function findProduct(userId: string, id: string) {
  const scope = productScope(userId, id)
  await connectMongo()
  const product = await ProductModel.findOne(scope).lean()
  return product ? productDto(product) : null
}
