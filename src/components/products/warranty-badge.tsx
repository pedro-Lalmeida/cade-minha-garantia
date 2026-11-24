import { CircleAlert, CircleCheck, Clock3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { warrantyStatusLabels, type WarrantyStatus } from "@/types/product"

export const warrantyStyles = {
  active: { Icon: CircleCheck, color: "bg-secondary text-primary", bar: "bg-primary" },
  expiring: { Icon: Clock3, color: "bg-warning-surface text-warning", bar: "bg-warning" },
  expired: { Icon: CircleAlert, color: "bg-expired-surface text-destructive", bar: "bg-destructive" },
}

export function WarrantyBadge({ status, today = false }: { status: WarrantyStatus; today?: boolean }) {
  const { Icon, color } = warrantyStyles[status]
  return (
    <Badge className={cn("h-auto min-h-6 max-w-full gap-1 rounded-full px-2 py-0.5 text-xs font-semibold leading-snug whitespace-normal", color)}>
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {today ? "Vence hoje" : warrantyStatusLabels[status]}
    </Badge>
  )
}
