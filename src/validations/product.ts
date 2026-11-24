import { z } from "zod"
import { isCalendarDate, warrantyEnd } from "../lib/warranty.ts"
import { categories } from "../types/product.ts"

const optionalText = (max: number) => z.string().trim().max(max, `Use até ${max} caracteres.`)
  .transform((value) => value || undefined).optional()

export const productSchema = z.object({
  name: z.string().trim().min(1, "Digite o nome do produto.").max(120, "Use até 120 caracteres."),
  brand: optionalText(80),
  category: z.enum(categories, { error: "Selecione uma categoria." }),
  purchaseDate: z.string().refine(isCalendarDate, "Informe uma data de compra válida."),
  purchasePrice: z.number({ error: "Informe um valor válido." }).min(0, "O valor deve ser positivo.")
    .max(999_999_999.99, "O valor informado é muito alto.")
    .refine((value) => Math.round(value * 100) / 100 === value, "Use até duas casas decimais.")
    .optional(),
  store: optionalText(120),
  warrantyMonths: z.number({ error: "Informe a duração em meses." })
    .int("Informe um número inteiro de meses.").min(1, "Informe pelo menos 1 mês.")
    .max(120_000, "A duração informada é muito alta."),
}).refine(({ purchaseDate, warrantyMonths }) => {
  if (!isCalendarDate(purchaseDate) || warrantyMonths < 1 || warrantyMonths > 120_000) return true
  return isCalendarDate(warrantyEnd(purchaseDate, warrantyMonths))
}, { path: ["warrantyMonths"], message: "A data de vencimento ultrapassa o calendário aceito." })

export const isProductId = (id: string) => /^[a-f\d]{24}$/i.test(id)
