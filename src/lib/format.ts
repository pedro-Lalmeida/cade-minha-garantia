const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatPrice(value: number) {
  return currency.format(value)
}

export function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-")
  return `${day}/${month}/${year}`
}

export function formatSize(bytes: number) {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
