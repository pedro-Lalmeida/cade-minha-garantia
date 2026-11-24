import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewProductLink({ children = "Cadastrar produto" }: { children?: React.ReactNode }) {
  return <Button asChild className="h-11 gap-2 px-4"><Link href="/produtos/novo"><Plus />{children}</Link></Button>
}
