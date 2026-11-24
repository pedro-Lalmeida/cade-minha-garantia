import { Skeleton } from "@/components/ui/skeleton"

export function ContentSkeleton() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Carregando conteúdo</span>
      <Skeleton className="h-8 w-52 max-w-full bg-secondary" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-26 rounded-xl bg-card" />)}
      </div>
      <Skeleton className="h-56 rounded-xl bg-card" />
    </div>
  )
}
