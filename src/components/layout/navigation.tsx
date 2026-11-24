"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()
  const links = [
    { href: "/dashboard", label: "Visão geral", short: "Início", icon: LayoutDashboard, active: pathname === "/dashboard" },
    { href: "/produtos", label: "Meus produtos", short: "Produtos", icon: Package, active: pathname.startsWith("/produtos") && pathname !== "/produtos/novo" },
    { href: "/produtos/novo", label: "Cadastrar produto", short: "Cadastrar", icon: PlusCircle, active: pathname === "/produtos/novo" },
  ]
  return (
    <nav aria-label="Navegação principal" className={mobile ? "grid grid-cols-3 gap-1" : "grid gap-1"}>
      {links.map(({ href, icon: Icon, label, short, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
            mobile && "justify-center gap-1.5 px-1",
            active ? "bg-secondary font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary",
          )}
        >
          <Icon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
          {mobile ? short : label}
        </Link>
      ))}
    </nav>
  )
}
