"use client"

import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUI } from "@/store/ui"
import type { Product } from "@/types/product"

export function ProductActions({ product, compact = false }: { product: Product; compact?: boolean }) {
  const setTarget = useUI((state) => state.setDeleteTarget)
  const href = `/produtos/${product.id}`

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "xl:justify-end" : ""}`}>
      {compact && (
        <Button asChild variant="ghost" size="icon-lg" className="size-11 text-primary">
          <Link href={href} aria-label={`Visualizar ${product.name}`} title="Visualizar"><Eye /></Link>
        </Button>
      )}
      <Button asChild variant={compact ? "ghost" : "outline"} className={compact ? "size-11 px-0 text-primary" : "h-11 px-3"}>
        <Link href={`${href}/editar`} aria-label={`Editar ${product.name}`} title="Editar">
          <Pencil />{compact ? null : "Editar produto"}
        </Link>
      </Button>
      <Button
        variant={compact ? "ghost" : "destructive"} type="button"
        className={compact ? "size-11 px-0 text-destructive hover:bg-expired-surface hover:text-destructive" : "h-11 px-3"}
        aria-label={`Excluir ${product.name}`} title="Excluir"
        onClick={() => setTarget({ id: product.id, name: product.name })}
      >
        <Trash2 />{compact ? null : "Excluir produto"}
      </Button>
    </div>
  )
}
