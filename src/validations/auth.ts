import { z } from "zod"

const email = z.email("Digite um e-mail válido.").max(254, "E-mail muito longo.")
const normalizedEmail = z.string().trim().toLowerCase().pipe(email)
const passwordBytes = (value: string) => new TextEncoder().encode(value).length <= 72

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1, "Digite sua senha.").refine(passwordBytes, "Use uma senha de até 72 bytes."),
})

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Digite seu nome completo.").max(100, "Use até 100 caracteres."),
  password: z.string().min(8, "Use pelo menos 8 caracteres.").refine(passwordBytes, "Use uma senha de até 72 bytes."),
  confirmPassword: z.string().min(1, "Confirme sua senha."),
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
  path: ["confirmPassword"],
  message: "As senhas não coincidem.",
})
