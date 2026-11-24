"use client"

import { Problem } from "@/components/shared/problem"
import { PublicFrame } from "@/components/shared/public-frame"

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <PublicFrame><Problem kind="error" retry={retry} /></PublicFrame>
}
