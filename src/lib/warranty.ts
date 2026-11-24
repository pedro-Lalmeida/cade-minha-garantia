import type { WarrantyStatus } from "../types/product.ts"

const dayInMilliseconds = 86_400_000
const calendar = new Intl.DateTimeFormat("en", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function calendarDate(now = new Date()) {
  const parts = Object.fromEntries(calendar.formatToParts(now).map(({ type, value }) => [type, value]))
  return `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}`
}

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false
  const date = new Date(value)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function warrantyEnd(purchaseDate: string, months: number) {
  const end = new Date(purchaseDate)
  const day = end.getUTCDate()
  end.setUTCDate(1)
  end.setUTCMonth(end.getUTCMonth() + months + 1, 0)
  end.setUTCDate(Math.min(end.getUTCDate(), day))
  return end.toISOString().split("T")[0]
}

export function warrantyInfo(purchaseDate: string, months: number, today = calendarDate()) {
  const end = warrantyEnd(purchaseDate, months)
  const days = (Date.parse(end) - Date.parse(today)) / dayInMilliseconds
  const status: WarrantyStatus = days < 0 ? "expired" : days <= 30 ? "expiring" : "active"
  return { end, days, status }
}

export function daysRemaining(days: number) {
  if (days === 0) return "Vence hoje"
  if (days < 0) return days === -1 ? "Venceu ontem" : `Venceu há ${-days} dias`
  return days === 1 ? "Falta 1 dia" : `Faltam ${days} dias`
}
