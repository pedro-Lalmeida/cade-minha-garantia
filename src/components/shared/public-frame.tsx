import { Brand } from "./brand"

export function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] px-4">
      <header className="flex justify-center py-7 sm:py-10"><Brand /></header>
      <main className="grid w-full place-items-center py-5">{children}</main>
      <footer className="py-7 text-center text-xs text-muted-foreground">
        Projeto acadêmico · Desenvolvimento Web II
      </footer>
    </div>
  )
}
