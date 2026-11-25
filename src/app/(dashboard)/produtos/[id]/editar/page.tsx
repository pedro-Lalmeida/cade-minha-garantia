import { EditProduct } from "@/components/products/edit-product"
import { requireProduct } from "@/lib/owned-product"

export const metadata = { title: "Editar produto" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await requireProduct((await params).id)
  return <EditProduct key={product.id} product={product} />
}
