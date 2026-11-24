import type { LucideIcon } from "lucide-react"

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="mx-auto grid max-w-md justify-items-center gap-2 px-5 py-10 text-center sm:py-12">
      <span className="mb-1 grid size-11 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h2 className="font-semibold tracking-tight">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
