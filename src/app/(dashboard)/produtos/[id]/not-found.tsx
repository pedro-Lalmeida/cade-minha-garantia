import { Problem } from "@/components/shared/problem"

export default function ProductNotFound() {
  return <div className="grid justify-items-center py-12"><Problem kind="not-found" back="/produtos" /></div>
}
