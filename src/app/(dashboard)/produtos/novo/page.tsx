import { ProductFormPage } from "@/components/products/product-form-page"
import { requireUser } from "@/lib/auth"

export const metadata = { title: "Cadastrar produto" }

export default async function NewProductPage() {
  await requireUser()
  return <ProductFormPage />
}
