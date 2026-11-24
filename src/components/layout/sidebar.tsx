import { Brand } from "@/components/shared/brand"
import { Navigation } from "./navigation"

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-62 flex-col border-r bg-card px-4 pt-6 md:flex">
      <div className="mb-8 px-2"><Brand href="/dashboard" /></div>
      <Navigation />
    </aside>
  )
}
