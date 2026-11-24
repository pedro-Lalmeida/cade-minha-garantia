"use client"

import { useEffect } from "react"
import { CircleCheck, CircleAlert, X } from "lucide-react"
import { useUI } from "@/store/ui"
import { Button } from "@/components/ui/button"

export function Toaster() {
  const notice = useUI((state) => state.notice)
  const setNotice = useUI((state) => state.setNotice)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5500)
    return () => window.clearTimeout(timer)
  }, [notice, setNotice])

  if (!notice) return null
  const Icon = notice.error ? CircleAlert : CircleCheck
  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border bg-card p-3 shadow-lg sm:left-auto sm:max-w-md">
      <Icon className={`size-5 shrink-0 ${notice.error ? "text-destructive" : "text-primary"}`} aria-hidden="true" />
      <p role={notice.error ? "alert" : "status"} className="min-w-0 flex-1 text-sm font-medium">{notice.message}</p>
      <Button variant="ghost" size="icon" aria-label="Dispensar aviso" onClick={() => setNotice(null)}><X /></Button>
    </div>
  )
}
