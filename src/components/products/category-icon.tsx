import { Armchair, CookingPot, Laptop, Package, Smartphone, Wrench } from "lucide-react"
import type { Category } from "@/types/product"

const icons = {
  "Eletrônicos": Smartphone,
  "Informática": Laptop,
  "Eletrodomésticos": CookingPot,
  "Móveis": Armchair,
  "Ferramentas": Wrench,
  "Outros": Package,
}

export function CategoryIcon({ category }: { category: Category }) {
  const Icon = icons[category] ?? Package
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
      <Icon className="size-[17px]" strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}
