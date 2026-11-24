import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex w-fit items-center gap-2.5 rounded-md text-primary">
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-white">
        <ShieldCheck aria-hidden="true" className="size-[21px]" strokeWidth={1.75} />
      </span>
      <span className="text-[0.94rem] font-bold tracking-[-0.035em]">Cadê Minha Garantia?</span>
    </Link>
  )
}
