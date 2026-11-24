import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="quiet-link inline-flex min-h-10 items-center gap-1 text-sm">
      <ChevronLeft className="size-4" aria-hidden="true" />{children}
    </Link>
  )
}
