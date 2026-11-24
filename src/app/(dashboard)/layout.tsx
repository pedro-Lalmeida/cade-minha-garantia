import { Suspense } from "react"
import Loading from "@/app/loading"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { DeleteDialog } from "@/components/products/delete-dialog"
import { requireUser } from "@/lib/auth"
import { AppProvider } from "@/providers/app-provider"
import { Toaster } from "@/components/shared/toaster"

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  return (
    <AppProvider key={user.id}>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3">Ir para o conteúdo</a>
      <Sidebar />
      <div className="min-h-dvh md:pl-62">
        <Header name={user.name ?? "Minha conta"} email={user.email ?? ""} />
        <main id="conteudo" className="page-container" tabIndex={-1}>{children}</main>
      </div>
      <DeleteDialog />
      <Toaster />
    </AppProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}><DashboardShell>{children}</DashboardShell></Suspense>
}
