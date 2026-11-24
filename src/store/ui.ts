import { create } from "zustand"
import type { Category, WarrantyStatus } from "@/types/product"

type Filters = { search: string; category: Category | ""; status: WarrantyStatus | "" }
const initialFilters: Filters = { search: "", category: "", status: "" }

type UIState = Filters & {
  setFilters: (filters: Partial<Filters>) => void
  resetFilters: () => void
  deleteTarget: { id: string; name: string } | null
  setDeleteTarget: (target: UIState["deleteTarget"]) => void
  notice: { message: string; error: boolean } | null
  setNotice: (notice: UIState["notice"]) => void
}

export const useUI = create<UIState>((set) => ({
  ...initialFilters,
  setFilters: (filters) => set(filters),
  resetFilters: () => set(initialFilters),
  deleteTarget: null,
  setDeleteTarget: (deleteTarget) => set({ deleteTarget }),
  notice: null,
  setNotice: (notice) => set({ notice }),
}))
