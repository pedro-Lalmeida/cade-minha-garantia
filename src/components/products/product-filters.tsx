"use client"

import { ChevronDown, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useUI } from "@/store/ui"
import { categories, warrantyStatusLabels, type Category, type WarrantyStatus } from "@/types/product"
import { cn } from "@/lib/utils"

const statuses = [
  { value: "", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "expiring", label: warrantyStatusLabels.expiring },
  { value: "expired", label: "Expiradas" },
] as const

export function ProductFilters() {
  const search = useUI((state) => state.search)
  const category = useUI((state) => state.category)
  const status = useUI((state) => state.status)
  const setFilters = useUI((state) => state.setFilters)
  const reset = useUI((state) => state.resetFilters)

  return (
    <Card className="gap-3 rounded-xl border p-3.5 shadow-none sm:p-4">
      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Situação da garantia">
        {statuses.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={status === value ? "default" : "ghost"}
            aria-pressed={status === value}
            className={cn("h-10 px-3", status !== value && "text-muted-foreground")}
            onClick={() => setFilters({ status: value as WarrantyStatus | "" })}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,17rem)_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search" aria-label="Pesquisar por nome" placeholder="Buscar produto por nome…"
            className="h-11 bg-background pl-9"
            value={search} onChange={(event) => setFilters({ search: event.target.value })}
          />
        </div>
        <div className="relative">
          <select
            aria-label="Filtrar por categoria"
            className="h-11 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus-visible:outline-2"
            value={category} onChange={(event) => setFilters({ category: event.target.value as Category | "" })}
          >
            <option value="">Todas as categorias</option>
            {categories.map((option) => <option key={option}>{option}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
        <Button variant="ghost" className="h-11 justify-self-start" disabled={!search && !category && !status} onClick={reset}>
          <X />Limpar filtros
        </Button>
      </div>
    </Card>
  )
}
