import { notFound } from "next/navigation"
import { isProductId } from "@/validations/product"
import { requireUser } from "./auth"
import { findProduct } from "./products"

export async function requireProduct(id: string) {
  const user = await requireUser()
  if (!isProductId(id)) notFound()
  const product = await findProduct(user.id, id)
  if (!product) notFound()
  return product
}
