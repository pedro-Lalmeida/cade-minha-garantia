import Image from "next/image"
import { Download, Eye, FileText, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatSize } from "@/lib/format"
import { receiptUrl } from "@/services/products"
import type { Product } from "@/types/product"

export function ReceiptCard({ product }: { product: Product }) {
  const receipt = product.receipt
  const url = receiptUrl(product.id)

  return (
    <Card className="h-fit gap-4 rounded-xl border p-4 shadow-none sm:p-5">
      <h2 className="section-title flex items-center gap-2"><Paperclip className="size-4 text-primary" aria-hidden="true" />Comprovante de compra</h2>
      {receipt ? (
        <>
          {receipt.mimeType.startsWith("image/") && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="relative block h-36 overflow-hidden rounded-lg bg-muted" aria-label="Abrir imagem do comprovante em outra aba">
              <Image src={url} alt="Prévia do comprovante de compra" fill sizes="(max-width: 1024px) 100vw, 24rem" unoptimized className="object-contain" />
            </a>
          )}
          <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold wrap-anywhere">{receipt.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatSize(receipt.size)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="h-11 px-3">
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Visualizar comprovante em outra aba"><Eye />Visualizar</a>
            </Button>
            <Button asChild variant="outline" className="h-11 px-3">
              <a href={receiptUrl(product.id, true)} download={receipt.name}><Download />Baixar</a>
            </Button>
          </div>
        </>
      ) : <p className="text-sm text-muted-foreground">Nenhum comprovante anexado.</p>}
    </Card>
  )
}
