"use client"

import { FileText, Trash2, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatSize } from "@/lib/format"
import { receiptUrl } from "@/services/products"
import type { Product } from "@/types/product"
import { receiptAccept } from "@/validations/receipt"

export function ReceiptField({ product, file, removed, disabled, error, selectFile, toggleRemove }: {
  product?: Product
  file?: File
  removed: boolean
  disabled: boolean
  error?: string
  selectFile: (file?: File) => void
  toggleRemove: () => void
}) {
  const current = product?.receipt
  const showCurrent = current && !file && !removed

  return (
    <div className="grid gap-3">
      {showCurrent && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-secondary/50 p-3">
          <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1 basis-32">
            <p className="text-sm font-medium wrap-anywhere">{current.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(current.size)}</p>
          </div>
          <Button asChild variant="ghost" className="h-10">
            <a href={receiptUrl(product.id)} target="_blank" rel="noopener noreferrer">Visualizar</a>
          </Button>
          <Button type="button" variant="ghost" className="h-10 text-destructive hover:text-destructive" disabled={disabled} onClick={toggleRemove}>
            <Trash2 />Remover
          </Button>
        </div>
      )}
      {removed && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted p-3">
          <p className="text-sm text-muted-foreground">O comprovante será removido ao salvar.</p>
          <Button type="button" variant="ghost" className="h-10" disabled={disabled} onClick={toggleRemove}>Desfazer</Button>
        </div>
      )}
      {file ? (
        <div className="flex items-center gap-2.5 rounded-lg border bg-secondary/50 p-3">
          <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium wrap-anywhere">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)} · Selecionado para envio</p>
          </div>
          <Button type="button" variant="ghost" size="icon-lg" disabled={disabled} onClick={() => selectFile()} aria-label="Cancelar seleção de arquivo"><X /></Button>
        </div>
      ) : (
        <div
          className="relative rounded-lg border border-dashed border-input bg-background/70 focus-within:outline-2 focus-within:outline-ring"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            if (!disabled && event.dataTransfer.files[0]) selectFile(event.dataTransfer.files[0])
          }}
        >
          <input
            id="receipt" type="file" accept={receiptAccept} className="sr-only"
            aria-label={showCurrent ? "Selecionar comprovante substituto" : "Selecionar comprovante"}
            aria-describedby={error ? "receipt-hint receipt-error" : "receipt-hint"} aria-invalid={Boolean(error)}
            disabled={disabled}
            onChange={(event) => {
              if (event.target.files?.[0]) selectFile(event.target.files[0])
              event.target.value = ""
            }}
          />
          <label htmlFor="receipt" className="grid min-h-32 cursor-pointer justify-items-center gap-1.5 rounded-lg px-3 py-5 text-center hover:bg-secondary/40">
            <UploadCloud className="size-6 text-primary" strokeWidth={1.6} aria-hidden="true" />
            <span className="text-sm font-semibold text-primary">{showCurrent ? "Selecionar outro comprovante" : "Arraste ou selecione um comprovante"}</span>
            <span id="receipt-hint" className="text-xs text-muted-foreground">PDF, JPG, JPEG ou PNG · Até 4 MB</span>
          </label>
        </div>
      )}
      {error && (
        <div className="flex flex-wrap items-center gap-2">
          <p id="receipt-error" role="alert" className="text-sm text-destructive">{error}</p>
          {!file && <Button type="button" variant="ghost" className="h-10" onClick={() => selectFile()}>Descartar seleção</Button>}
        </div>
      )}
      {disabled && file && <p role="status" className="text-sm text-muted-foreground">Enviando comprovante…</p>}
    </div>
  )
}
