import { ProductDetail } from "@/components/products/product-detail"
import { requireProduct } from "@/lib/owned-product"

export const metadata = { title: "Detalhes do produto" }

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await requireProduct((await params).id)
  return <ProductDetail product={product} />
}
