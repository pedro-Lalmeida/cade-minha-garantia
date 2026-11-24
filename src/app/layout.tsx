import type { Metadata } from "next"
import "@fontsource-variable/inter"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Cadê Minha Garantia?", template: "%s | Cadê Minha Garantia?" },
  description: "Organize seus produtos, guarde comprovantes e acompanhe o vencimento das garantias.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  )
}
