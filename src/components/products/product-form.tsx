"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck, ChevronDown, LoaderCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/shared/form-field"
import { useSaveProduct } from "@/hooks/use-products"
import { formatDate } from "@/lib/format"
import { isCalendarDate, warrantyEnd } from "@/lib/warranty"
import { RequestError } from "@/services/products"
import { useUI } from "@/store/ui"
import { categories, type Product } from "@/types/product"
import { productSchema } from "@/validations/product"
import { validateReceiptFile } from "@/validations/receipt"
import { ReceiptField } from "./receipt-field"

type FieldErrors = Record<string, string[] | undefined>

export function ProductForm({ product }: { product?: Product }) {
  const [date, setDate] = useState(product?.purchaseDate ?? "")
  const [months, setMonths] = useState(product ? String(product.warrantyMonths) : "")
  const [file, setFile] = useState<File>()
  const [removeReceipt, setRemoveReceipt] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState("")
  const setNotice = useUI((state) => state.setNotice)
  const router = useRouter()
  const mutation = useSaveProduct()
  const busy = mutation.isPending
  const cancelHref = product ? `/produtos/${product.id}` : "/produtos"
  const duration = Number(months)
  const end = isCalendarDate(date) && Number.isInteger(duration) && duration > 0 && duration <= 120_000
    ? warrantyEnd(date, duration) : ""
  const preview = isCalendarDate(end) ? formatDate(end) : ""

  function selectFile(selected?: File) {
    const error = selected && validateReceiptFile(selected)
    setErrors((current) => ({ ...current, receipt: error ? [error] : undefined }))
    if (error) return
    setFile(selected)
    if (selected) setRemoveReceipt(false)
  }

  function resetDraft() {
    setDate(product?.purchaseDate ?? "")
    setMonths(product ? String(product.warrantyMonths) : "")
    setFile(undefined)
    setRemoveReceipt(false)
    setErrors({})
    setMessage("")
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const formElement = event.currentTarget
    const form = Object.fromEntries(new FormData(formElement))
    const price = typeof form.purchasePrice === "string" ? form.purchasePrice.trim() : ""
    const purchasePrice = !price ? undefined : /^\d+(?:[.,]\d{1,2})?$/.test(price) ? Number(price.replace(",", ".")) : NaN
    const parsed = productSchema.safeParse({ ...form, purchasePrice, warrantyMonths: months ? duration : undefined })
    setMessage("")
    if (!parsed.success) {
      setErrors((current) => ({ receipt: current.receipt, ...parsed.error.flatten().fieldErrors }))
      return
    }
    if (errors.receipt && !file) {
      setErrors({ receipt: errors.receipt })
      return
    }
    setErrors({})
    try {
      const saved = await mutation.mutateAsync({ id: product?.id, fields: parsed.data, receipt: file, removeReceipt })
      if (!product) formElement.reset()
      setNotice({ message: product ? "Alterações salvas." : "Produto cadastrado.", error: false })
      router.push(`/produtos/${saved.id}`)
    } catch (error) {
      if (error instanceof RequestError && error.details.fields) {
        setErrors(error.details.fields)
      } else {
        const text = error instanceof Error ? error.message : "Não foi possível salvar o produto."
        setMessage(text)
        setNotice({ message: text, error: true })
      }
    }
  }

  function field(id: string) {
    return { id, name: id, "aria-invalid": Boolean(errors[id]), "aria-describedby": errors[id] ? `${id}-error` : undefined }
  }

  return (
    <Card className="gap-0 rounded-xl border p-4 shadow-[0_2px_10px_#26382a05] sm:p-6">
      <form onSubmit={submit} onReset={resetDraft} noValidate>
        <fieldset disabled={busy} className="grid min-w-0 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField id="name" label="Nome do produto" error={errors.name?.[0]}>
              <Input {...field("name")} defaultValue={product?.name} placeholder="Ex. Robô aspirador" maxLength={120} required className="h-11" />
            </FormField>
          </div>
          <FormField id="brand" label="Marca" optional error={errors.brand?.[0]}>
            <Input {...field("brand")} defaultValue={product?.brand} placeholder="Ex. Xiaomi" maxLength={80} className="h-11" />
          </FormField>
          <FormField id="category" label="Categoria" error={errors.category?.[0]}>
            <div className="relative">
              <select {...field("category")} defaultValue={product?.category ?? ""} required className="h-11 w-full appearance-none rounded-md border border-input bg-card px-3 pr-9 text-base aria-invalid:border-destructive sm:text-sm">
                <option value="" disabled>Selecione a categoria</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
          </FormField>
          <FormField id="purchaseDate" label="Data da compra" error={errors.purchaseDate?.[0]}>
            <Input {...field("purchaseDate")} type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-11 min-w-0" />
          </FormField>
          <FormField id="purchasePrice" label="Valor da compra" optional error={errors.purchasePrice?.[0]}>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">R$</span>
              <Input {...field("purchasePrice")} inputMode="decimal" defaultValue={product?.purchasePrice?.toFixed(2).replace(".", ",")} placeholder="0,00" maxLength={14} className="h-11 pl-10" />
            </div>
          </FormField>
          <FormField id="store" label="Loja" optional error={errors.store?.[0]}>
            <Input {...field("store")} defaultValue={product?.store} placeholder="Ex. Loja ABC" maxLength={120} className="h-11" />
          </FormField>
          <FormField id="warrantyMonths" label="Duração da garantia em meses" error={errors.warrantyMonths?.[0]}>
            <Input {...field("warrantyMonths")} type="number" inputMode="numeric" min={1} step={1} required value={months} onChange={(event) => setMonths(event.target.value)} placeholder="Ex. 12" className="h-11" />
          </FormField>
          <div className="flex items-center gap-2.5 rounded-lg bg-secondary px-3 py-3.5 text-sm text-primary sm:col-span-2">
            <CalendarCheck className="size-5 shrink-0" aria-hidden="true" />
            <output aria-live="polite">
              {preview ? <>Vencimento previsto <strong className="ml-1 tabular-nums">{preview}</strong></> : "Informe a data da compra e a duração para calcular o vencimento."}
            </output>
          </div>
          <section aria-labelledby="receipt-title" className="grid gap-2 sm:col-span-2">
            <h2 id="receipt-title" className="text-sm font-semibold">Comprovante de compra <span className="font-normal text-muted-foreground">(opcional)</span></h2>
            <ReceiptField product={product} file={file} removed={removeReceipt} disabled={busy} error={errors.receipt?.[0]} selectFile={selectFile} toggleRemove={() => {
              setRemoveReceipt((value) => !value)
              setErrors((current) => ({ ...current, receipt: undefined }))
            }} />
          </section>
        </fieldset>
        {message && <p role="alert" className="mt-4 rounded-lg bg-expired-surface p-3 text-sm text-destructive">{message}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-5">
          <Button type="reset" variant="outline" className="h-11 px-4" disabled={busy} onClick={() => router.push(cancelHref)}>Cancelar</Button>
          <Button type="submit" disabled={busy} className="h-11 px-4">
            {busy ? <LoaderCircle className="animate-spin" /> : <Save />}
            {busy ? "Salvando…" : product ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
