"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { ChevronDown, LoaderCircle, LogOut, Search } from "lucide-react"
import { useUI } from "@/store/ui"
import { Brand } from "@/components/shared/brand"
import { Toaster } from "@/components/shared/toaster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Navigation } from "./navigation"

export function Header({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [leaving, setLeaving] = useState(false)
  const [logoutError, setLogoutError] = useState(false)
  const setFilters = useUI((state) => state.setFilters)
  const initials = name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()

  function find(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFilters({ search: search.trim(), category: "", status: "" })
    router.push("/produtos")
  }

  async function logout() {
    setLeaving(true)
    setLogoutError(false)
    try {
      await signOut({ callbackUrl: "/login" })
    } catch {
      setLeaving(false)
      setLogoutError(true)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-card">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-7 lg:px-9">
        <div className="md:hidden"><Brand href="/dashboard" /></div>
        <form onSubmit={find} role="search" className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Buscar produto no painel"
            type="search"
            placeholder="Buscar produto por nome…"
            className="h-10 border-transparent bg-background pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-2.5 rounded-lg px-1.5 sm:px-2" aria-label={`Menu da conta de ${name}`}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary" aria-hidden="true">{initials}</span>
              <span className="hidden max-w-44 truncate sm:block">{name}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-w-[calc(100vw-2rem)] min-w-52">
            <DropdownMenuLabel>
              <span className="block truncate font-semibold">{name}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={leaving} onSelect={(event) => { event.preventDefault(); void logout() }}>
              {leaving ? <LoaderCircle className="animate-spin" /> : <LogOut />}
              {leaving ? "Saindo…" : "Sair"}
            </DropdownMenuItem>
            {logoutError && <p role="alert" className="p-2 text-sm text-destructive">Não foi possível sair. Tente novamente.</p>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-3 pb-2 md:hidden"><Navigation mobile /></div>
      <Toaster />
    </header>
  )
}
