"use client"

import { RotateCcw, TriangleAlert } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QueryError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Card className="items-start gap-3 rounded-xl border p-5 shadow-none">
      <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
        <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />{error.message}
      </p>
      <Button variant="outline" className="h-11" onClick={retry}><RotateCcw />Tentar novamente</Button>
    </Card>
  )
}
