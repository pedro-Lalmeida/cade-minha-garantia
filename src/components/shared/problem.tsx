import Link from "next/link"
import { RotateCcw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function Problem({ kind, retry, back = "/dashboard" }: {
  kind: "error" | "not-found"
  retry?: () => void
  back?: string
}) {
  const missing = kind === "not-found"
  return (
    <Card className="w-full max-w-sm gap-4 rounded-xl border p-7 text-center shadow-none sm:p-8">
      <div className={`mx-auto grid size-13 place-items-center rounded-xl font-bold ${missing ? "bg-secondary text-primary" : "bg-expired-surface text-destructive"}`}>
        {missing ? "404" : <TriangleAlert className="size-6" aria-hidden="true" />}
      </div>
      <div className="space-y-2">
        <h1 className="text-xl leading-snug font-bold tracking-tight">
          {missing ? "Página não encontrada" : "Não foi possível carregar esta página"}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {missing ? "O endereço pode ter mudado ou o conteúdo pode ter sido removido." : "Tente novamente para continuar de onde parou."}
        </p>
      </div>
      <div className="grid gap-2 pt-1">
        {retry && <Button onClick={retry} className="h-11"><RotateCcw />Tentar novamente</Button>}
        <Button asChild variant={retry ? "outline" : "default"} className="h-11">
          <Link href={back}>{back === "/produtos" ? "Voltar para Meus produtos" : "Voltar para o painel"}</Link>
        </Button>
      </div>
    </Card>
  )
}
