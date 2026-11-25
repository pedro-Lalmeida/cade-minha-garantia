import { BackLink } from "@/components/shared/back-link"
import type { Product } from "@/types/product"
import { ProductForm } from "./product-form"

export function ProductFormPage({ product, onReload }: { product?: Product; onReload?: () => Promise<void> }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href={product ? `/produtos/${product.id}` : "/produtos"}>
        {product ? "Voltar para detalhes" : "Voltar para Meus produtos"}
      </BackLink>
      <div className="pb-1">
        <h1 className="page-title">{product ? "Editar produto" : "Cadastrar produto"}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {product ? `Atualize os dados e o comprovante de ${product.name}.` : "Preencha os dados da compra para acompanhar a garantia."}
        </p>
      </div>
      <ProductForm key={product ? `${product.id}:${product.version}` : "new"} product={product} onReload={onReload} />
    </div>
  )
}
