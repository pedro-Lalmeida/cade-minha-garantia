"use client"

import { useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteProduct } from "@/hooks/use-products"
import { useUI } from "@/store/ui"

export function DeleteDialog() {
  const target = useUI((state) => state.deleteTarget)
  const setTarget = useUI((state) => state.setDeleteTarget)
  const setNotice = useUI((state) => state.setNotice)
  const router = useRouter()
  const pathname = usePathname()
  const mutation = useDeleteProduct()
  const trigger = useRef<HTMLElement | null>(null)

  function close() {
    if (mutation.isPending) return
    mutation.reset()
    setTarget(null)
  }

  async function confirm() {
    if (!target || mutation.isPending) return
    try {
      await mutation.mutateAsync(target.id)
      setTarget(null)
      setNotice({ message: "Produto excluído.", error: false })
      if (pathname !== "/produtos") router.replace("/produtos")
    } catch {
      setNotice({ message: "Não foi possível excluir o produto.", error: true })
    }
  }

  return (
    <AlertDialog open={Boolean(target)} onOpenChange={(open) => { if (!open) close() }}>
      <AlertDialogContent
        onOpenAutoFocus={() => { trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const destination = trigger.current?.isConnected ? trigger.current : document.getElementById("conteudo")
          destination?.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
          <AlertDialogDescription className="wrap-break-word">
            {target && <strong>{target.name}</strong>} e seu comprovante serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.error && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" disabled={mutation.isPending} onClick={() => void confirm()}>
            {mutation.isPending && <LoaderCircle className="animate-spin" />}
            {mutation.isPending ? "Excluindo…" : "Excluir produto"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
