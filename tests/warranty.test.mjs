import { PDFDocument } from "pdf-lib"
import sharp from "sharp"
import { validReceiptContent } from "../src/lib/receipt-content.ts"
import { test } from "node:test"
import assert from "node:assert/strict"
import { calendarDate, daysRemaining, isCalendarDate, warrantyEnd, warrantyInfo } from "../src/lib/warranty.ts"
import { filterProducts, productsWithWarranty } from "../src/lib/product-view.ts"
import { productSchema, isProductId } from "../src/validations/product.ts"
import { registerSchema } from "../src/validations/auth.ts"
import { matchesReceiptSignature, receiptLimit, validateReceiptFile } from "../src/validations/receipt.ts"

test("adiciona meses preservando o dia até o limite do mês de destino", () => {
  assert.equal(warrantyEnd("2023-01-31", 1), "2023-02-28")
  assert.equal(warrantyEnd("2024-01-31", 1), "2024-02-29")
  assert.equal(warrantyEnd("2024-02-29", 12), "2025-02-28")
  assert.equal(warrantyEnd("2025-12-31", 1), "2026-01-31")
  assert.equal(warrantyEnd("2025-08-31", 2), "2025-10-31")
})

test("classifica 31, 30, 0 e -1 dia de garantia", () => {
  const purchase = "2026-01-09"
  assert.deepEqual(warrantyInfo(purchase, 2, "2026-02-06"), { end: "2026-03-09", days: 31, status: "active" })
  assert.deepEqual(warrantyInfo(purchase, 2, "2026-02-07"), { end: "2026-03-09", days: 30, status: "expiring" })
  assert.deepEqual(warrantyInfo(purchase, 2, "2026-03-09"), { end: "2026-03-09", days: 0, status: "expiring" })
  assert.deepEqual(warrantyInfo(purchase, 2, "2026-03-10"), { end: "2026-03-09", days: -1, status: "expired" })
  assert.equal(daysRemaining(0), "Vence hoje")
})

test("usa a virada de dia de São Paulo, inclusive nas regras históricas de fuso", () => {
  assert.equal(calendarDate(new Date("2026-03-10T02:59:59Z")), "2026-03-09")
  assert.equal(calendarDate(new Date("2026-03-10T03:00:00Z")), "2026-03-10")
  assert.equal(calendarDate(new Date("2018-01-01T02:00:00Z")), "2018-01-01")
  assert.equal(isCalendarDate("2024-02-29"), true)
  assert.equal(isCalendarDate("2025-02-29"), false)
  assert.equal(isCalendarDate("2026-04-31"), false)
  assert.equal(isCalendarDate("11/05/2026"), false)
})

const fields = { name: "Câmera digital", category: "Eletrônicos", purchaseDate: "2026-01-09", warrantyMonths: 2 }

test("combina busca sem acentos, categoria e status sobre o mesmo calendário", () => {
  const products = productsWithWarranty([
    { ...fields, id: "1" },
    { ...fields, id: "2", name: "Câmera USB", category: "Informática" },
    { ...fields, id: "3", warrantyMonths: 1 },
  ], "2026-03-01")
  const result = filterProducts(products, { search: "  CAMERA", category: "Eletrônicos", status: "expiring" })
  assert.deepEqual(result.map(({ product }) => product.id), ["1"])
})

test("valida campos de produto e descarta dados de propriedade enviados pelo cliente", () => {
  const parsed = productSchema.parse({ ...fields, purchasePrice: 0, brand: " ", userId: "outro-usuario" })
  assert.equal(parsed.purchasePrice, 0)
  assert.equal(parsed.brand, undefined)
  assert.equal(Object.hasOwn(parsed, "userId"), false)
  assert.equal(productSchema.safeParse({ ...fields, purchasePrice: 1.001 }).success, false)
  assert.equal(productSchema.safeParse({ ...fields, warrantyMonths: 0 }).success, false)
  assert.equal(productSchema.safeParse({ ...fields, warrantyMonths: 1.5 }).success, false)
  assert.equal(productSchema.safeParse({ ...fields, purchaseDate: "9999-12-31" }).success, false)
  assert.equal(isProductId("64f2029883eb95adeaf620a9"), true)
  assert.equal(isProductId("64f2029z83eb95adeaf620a9"), false)
})

test("normaliza o e-mail e valida confirmação e limite de bytes do bcrypt", () => {
  const input = { name: "  Usuário Teste ", email: "  USUARIO@EXAMPLE.TEST ", password: "senha-de-teste" }
  const user = registerSchema.parse({ ...input, confirmPassword: input.password })
  assert.equal(user.name, "Usuário Teste")
  assert.equal(user.email, "usuario@example.test")
  assert.equal(registerSchema.safeParse({ ...input, confirmPassword: "diferente" }).success, false)
  const long = "é".repeat(37)
  assert.equal(registerSchema.safeParse({ ...input, password: long, confirmPassword: long }).success, false)
})

test("valida formato, tipo, tamanho e assinatura dos comprovantes", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  assert.equal(validateReceiptFile(new File([png], "Nota.PNG", { type: "image/png" })), undefined)
  assert.match(validateReceiptFile(new File([png], "Nota.gif", { type: "image/gif" })), /PDF, JPG/)
  assert.match(validateReceiptFile(new File([png], "Nota.jpg", { type: "image/png" })), /não corresponde/)
  assert.match(validateReceiptFile(new File([new Uint8Array(receiptLimit + 1)], "Nota.png", { type: "image/png" })), /até 4 MB/)
  assert.equal(matchesReceiptSignature(png, "image/png"), true)
  assert.equal(matchesReceiptSignature(png, "image/jpeg"), false)
  assert.equal(matchesReceiptSignature(new Uint8Array([0xff, 0xd8, 0xff]), "image/jpeg"), true)
  assert.equal(matchesReceiptSignature(new TextEncoder().encode("%PDF-1.4"), "application/pdf"), true)
})

test("decodifica o comprovante aceito e rejeita arquivos truncados ou disfarçados", async () => {
  const input = { create: { width: 20, height: 20, channels: 3, background: "white" } }
  const png = await sharp(input).png().toBuffer()
  const jpeg = await sharp(input).jpeg().toBuffer()
  assert.equal(await validReceiptContent(png, "image/png"), true)
  assert.equal(await validReceiptContent(jpeg, "image/jpeg"), true)
  assert.equal(await validReceiptContent(png, "image/jpeg"), false)
  assert.equal(await validReceiptContent(png.subarray(0, -16), "image/png"), false)
  assert.equal(await validReceiptContent(jpeg.subarray(0, -10), "image/jpeg"), false)
})

test("analisa PDFs com tabela ou stream de referências e rejeita documentos incompletos", async () => {
  const document = await PDFDocument.create()
  document.addPage()
  for (const useObjectStreams of [true, false]) {
    const pdf = Buffer.from(await document.save({ useObjectStreams }))
    assert.equal(await validReceiptContent(pdf, "application/pdf"), true)
    assert.equal(await validReceiptContent(pdf.subarray(0, -12), "application/pdf"), false)
    const invalidOffset = Buffer.from(pdf.toString("latin1").replace(/startxref\s+\d+/, "startxref\n1"), "latin1")
    assert.equal(await validReceiptContent(invalidOffset, "application/pdf"), false)
  }
  assert.equal(await validReceiptContent(Buffer.from("%PDF-1.7\n%%EOF"), "application/pdf"), false)
})
