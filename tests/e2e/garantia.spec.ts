import { randomUUID } from "node:crypto"
import { setServers } from "node:dns"
import { existsSync } from "node:fs"
import { loadEnvFile } from "node:process"
import { expect, test, type APIRequestContext, type Page } from "@playwright/test"
import { compare } from "bcryptjs"
import mongoose from "mongoose"
import { calendarDate } from "../../src/lib/warranty"
import { formatDate } from "../../src/lib/format"
import type { Product, ProductInput } from "../../src/types/product"

const password = "Garantia-test-2026!"
const ownerEmail = `garantia-e2e-${randomUUID()}@example.test`
const otherEmail = `garantia-e2e-${randomUUID()}@example.test`
const testEmails = [ownerEmail, otherEmail]

const account = (email: string, name = "Marina Teste") => ({
  name, email, password, confirmPassword: password,
})

async function register(request: APIRequestContext, email: string) {
  return request.post("/api/auth/cadastro", { data: account(email, "André Teste") })
}

async function login(page: Page, email: string, value: string) {
  await page.getByLabel("E-mail", { exact: true }).fill(email)
  await page.getByLabel("Senha", { exact: true }).fill(value)
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
}

function daysAgo(days: number) {
  const date = new Date(calendarDate())
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function productData(overrides: Partial<ProductInput> = {}): ProductInput {
  return { name: "Câmera de teste", category: "Eletrônicos", purchaseDate: daysAgo(2), warrantyMonths: 12, ...overrides }
}

function multipart(product: ProductInput, receipt?: { name: string; mimeType: string; buffer: Buffer }) {
  return { product: JSON.stringify(product), ...(receipt ? { receipt } : {}) }
}

function pdfExample() {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] >>",
  ]
  let text = "%PDF-1.4\n"
  const offsets = objects.map((object, index) => {
    const offset = text.length
    text += `${index + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const start = text.length
  text += "xref\n0 4\n0000000000 65535 f \n"
  for (const offset of offsets) text += `${String(offset).padStart(10, "0")} 00000 n \n`
  return Buffer.from(text + `trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`)
}

async function testDatabase() {
  if (existsSync(".env.local")) loadEnvFile(".env.local")
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI é necessária para o teste de integração.")
  if (process.env.MONGODB_DEV_DNS) setServers(process.env.MONGODB_DEV_DNS.split(",").map((value) => value.trim()))
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8_000 })
  } catch {
    throw new Error("O teste de integração não conseguiu acessar o MongoDB.")
  }
  const db = mongoose.connection.db
  if (!db) throw new Error("Banco de teste indisponível.")
  return db
}

test.afterAll(async () => {
  try {
    const db = await testDatabase()
    const filter = { email: { $in: testEmails } }
    const users = await db.collection("users").find(filter, { projection: { _id: 1 } }).toArray()
    await db.collection("products").deleteMany({ userId: { $in: users.map((user) => user._id) } })
    await db.collection("users").deleteMany(filter)
  } finally {
    await mongoose.disconnect()
  }
})

test("fluxo completo com contas isoladas, comprovantes e interface responsiva", async ({ page, browser }, testInfo) => {
  await test.step("Protege páginas e endpoints quando não há sessão", async () => {
    for (const path of ["/dashboard", "/produtos", "/produtos/novo", "/produtos/0123456789abcdef01234567/editar"]) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByRole("heading", { name: "Entrar na sua conta" })).toBeVisible()
    }
    const sample = "/api/produtos/0123456789abcdef01234567"
    for (const [path, method] of [
      ["/api/produtos", "GET"], ["/api/produtos", "POST"], [sample, "GET"],
      [sample, "PATCH"], [sample, "DELETE"], [`${sample}/comprovante`, "GET"],
    ]) {
      expect((await page.request.fetch(path, { method })).status()).toBe(401)
    }
  })

  await test.step("Cadastra uma conta, aplica unicidade e inicia a sessão", async () => {
    await page.getByRole("link", { name: "Criar uma conta" }).click()
    await expect(page).toHaveURL(/\/cadastro$/)
    await page.getByRole("button", { name: "Criar conta", exact: true }).click()
    await expect(page.getByText("Digite seu nome completo.")).toBeVisible()
    await page.getByLabel("Nome completo").fill("Marina Teste")
    await page.getByLabel("E-mail", { exact: true }).fill(ownerEmail)
    await page.getByLabel("Senha", { exact: true }).fill(password)
    await page.getByRole("button", { name: "Mostrar senha" }).first().click()
    await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("type", "text")
    await page.getByRole("button", { name: "Ocultar senha" }).click()
    await page.getByLabel("Confirmar senha").fill(password)
    await page.getByRole("button", { name: "Criar conta", exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole("heading", { name: "Olá, Marina" })).toBeVisible()
    await expect(page.getByText("Seus produtos aparecem aqui")).toBeVisible()
    expect((await register(page.request, ownerEmail.toUpperCase())).status()).toBe(409)

    const db = await testDatabase()
    const persisted = await db.collection("users").findOne({ email: ownerEmail })
    expect(persisted?.passwordHash).toMatch(/^\$2[aby]\$12\$/)
    expect(await compare(password, persisted?.passwordHash)).toBe(true)
    await mongoose.disconnect()

    const response = await page.request.get("/api/auth/session")
    expect(await response.text()).not.toContain("passwordHash")
    await page.getByRole("link", { name: "Meus produtos", exact: true }).click()
    await expect(page.getByText("Você ainda não tem produtos")).toBeVisible()
  })

  const png = Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 180
    canvas.height = 120
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#e7f1ea"
    ctx.fillRect(0, 0, 180, 120)
    ctx.fillStyle = "#174c3c"
    ctx.fillRect(25, 20, 130, 12)
    ctx.fillRect(25, 47, 85, 8)
    ctx.fillRect(25, 65, 100, 8)
    return canvas.toDataURL().split(",")[1]
  }), "base64")
  const pdf = pdfExample()
  const data = productData()
  let id = ""

  await test.step("Cria produto com comprovante e atualiza o cache da lista", async () => {
    await page.getByRole("link", { name: "Novo produto", exact: true }).click()
    await page.getByLabel("Nome do produto").fill(data.name)
    await page.getByLabel("Categoria", { exact: true }).selectOption(data.category)
    await page.getByLabel("Data da compra").fill(data.purchaseDate)
    await page.getByLabel("Valor da compra").fill("179,90")
    await page.getByLabel("Marca").fill("Teste Ótica")
    await page.getByLabel("Loja").fill("Loja de teste")
    await page.getByLabel("Duração da garantia em meses").fill("12")
    await expect(page.getByText("Vencimento previsto")).toBeVisible()
    await page.locator("#receipt").setInputFiles({ name: "nota.gif", mimeType: "image/gif", buffer: png })
    await expect(page.getByRole("alert").filter({ hasText: "Selecione um arquivo PDF" })).toBeVisible()
    await page.getByRole("button", { name: "Descartar seleção" }).click()
    await page.locator("#receipt").setInputFiles({ name: "nota.png", mimeType: "image/png", buffer: png })
    await page.getByRole("button", { name: "Cadastrar produto", exact: true }).click()
    await expect(page).toHaveURL(/\/produtos\/[a-f0-9]{24}$/)
    id = new URL(page.url()).pathname.split("/").at(-1)!
    await expect(page.getByRole("heading", { name: data.name })).toBeVisible()
    await expect(page.getByText("R$ 179,90")).toBeVisible()
    const image = page.getByRole("img", { name: "Prévia do comprovante de compra" })
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(180)

    const inline = await page.request.get(`/api/produtos/${id}/comprovante`)
    expect(inline.status()).toBe(200)
    expect(inline.headers()["cache-control"]).toBe("private, no-store")
    expect(inline.headers()["content-disposition"]).toMatch(/^inline/)
    expect(await inline.body()).toEqual(png)
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Baixar" }).click(),
    ])
    expect(download.suggestedFilename()).toBe("nota.png")

    await page.getByRole("link", { name: "Voltar para Meus produtos" }).click()
    await expect(page.getByRole("link", { name: data.name, exact: true })).toBeVisible()
    await expect(page.getByText("Comprovante", { exact: true })).toBeVisible()
  })

  await test.step("Confere validação no servidor e pesquisa pelos filtros", async () => {
    expect((await page.request.get("/api/produtos/id-invalido")).status()).toBe(400)
    const invalid = await page.request.post("/api/produtos", { multipart: multipart(data, {
      name: "foto.png", mimeType: "image/png", buffer: Buffer.from("arquivo inválido"),
    }) })
    expect(invalid.status()).toBe(422)
    expect((await invalid.json()).fields.receipt[0]).toContain("conteúdo do arquivo")
    const wrongOrigin = await page.request.post("/api/produtos", {
      multipart: multipart(data), headers: { Origin: "https://example.test" },
    })
    expect(wrongOrigin.status()).toBe(403)

    const upcoming = productData({ name: "Roteador de teste", category: "Informática", purchaseDate: daysAgo(20), warrantyMonths: 1 })
    const expired = productData({ name: "Ferro de teste", category: "Eletrodomésticos", purchaseDate: daysAgo(100), warrantyMonths: 1 })
    for (const fields of [upcoming, expired]) {
      expect((await page.request.post("/api/produtos", { multipart: multipart(fields) })).status()).toBe(201)
    }
    await page.reload()
    await expect(page.getByText("3 produtos encontrados")).toBeVisible()
    await page.getByRole("searchbox", { name: "Pesquisar por nome" }).fill("camera")
    await expect(page.getByRole("link", { name: data.name, exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: upcoming.name, exact: true })).toHaveCount(0)
    await page.getByLabel("Filtrar por categoria").selectOption("Informática")
    await expect(page.getByText("Nenhum produto encontrado")).toBeVisible()
    await page.getByRole("button", { name: "Limpar filtros" }).first().click()
    await page.getByRole("button", { name: "Próxima do vencimento" }).click()
    await expect(page.getByRole("link", { name: upcoming.name, exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: expired.name, exact: true })).toHaveCount(0)
    await page.getByRole("button", { name: "Expiradas" }).click()
    await expect(page.getByRole("link", { name: expired.name, exact: true })).toBeVisible()
    await page.getByRole("button", { name: "Limpar filtros" }).click()

    await page.getByRole("link", { name: "Visão geral" }).click()
    await expect(page.getByRole("link", { name: /Roteador de teste/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /Ferro de teste/ })).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath("dashboard-desktop.png") })
  })

  await test.step("Isola produtos e comprovantes entre duas contas", async () => {
    const context = await browser.newContext({ baseURL: "http://localhost:3000", locale: "pt-BR" })
    try {
      const other = await context.newPage()
      expect((await register(other.request, otherEmail)).status()).toBe(201)
      await other.goto("/login")
      await login(other, otherEmail, "senha-errada")
      await expect(other.getByRole("alert").filter({ hasText: "E-mail ou senha inválidos." })).toBeVisible()
      await login(other, otherEmail, password)
      await expect(other).toHaveURL(/\/dashboard$/)
      expect(await (await other.request.get("/api/produtos")).json()).toEqual([])
      const path = `/api/produtos/${id}`
      expect((await other.request.get(path)).status()).toBe(404)
      expect((await other.request.patch(path, { multipart: multipart(data) })).status()).toBe(404)
      expect((await other.request.delete(path)).status()).toBe(404)
      expect((await other.request.get(`${path}/comprovante?download=1`)).status()).toBe(404)
      await other.goto(`/produtos/${id}/editar`)
      await expect(other.getByRole("heading", { name: "Página não encontrada" })).toBeVisible()
      await expect(other.getByLabel("Nome do produto")).toHaveCount(0)
      await other.getByRole("button", { name: "Menu da conta de André Teste" }).click()
      await other.getByRole("menuitem", { name: "Sair", exact: true }).click()
      await expect(other).toHaveURL(/\/login$/)
      expect((await other.request.get("/api/produtos")).status()).toBe(401)
    } finally {
      await context.close()
    }
  })

  await test.step("Edita o produto, substitui e remove o comprovante", async () => {
    await page.goto(`/produtos/${id}`)
    await page.getByRole("link", { name: `Editar ${data.name}` }).click()
    await expect(page.getByLabel("Nome do produto")).toHaveValue(data.name)
    await page.getByLabel("Nome do produto").fill("Câmera revisada")
    await page.getByLabel("Marca").fill("")
    await page.getByLabel("Valor da compra").fill("")
    await page.getByLabel("Duração da garantia em meses").fill("18")
    await page.locator("#receipt").setInputFiles({ name: "nota-atualizada.pdf", mimeType: "application/pdf", buffer: pdf })
    await page.getByRole("button", { name: "Salvar alterações", exact: true }).click()
    await expect(page.getByRole("heading", { name: "Câmera revisada" })).toBeVisible()
    await expect(page.getByText("18 meses", { exact: true })).toBeVisible()
    await expect(page.getByText("nota-atualizada.pdf", { exact: true }).filter({ visible: true })).toBeVisible()
    const updated = await page.request.get(`/api/produtos/${id}/comprovante`)
    expect(updated.headers()["content-type"]).toBe("application/pdf")
    expect(await updated.body()).toEqual(pdf)
    const [viewer] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: "Visualizar comprovante em outra aba" }).click(),
    ])
    await expect(viewer).toHaveURL(/\/comprovante$/)
    await viewer.close()
    const stored: Product = await (await page.request.get(`/api/produtos/${id}`)).json()
    expect(stored.brand).toBeUndefined()
    expect(stored.purchasePrice).toBeUndefined()
    expect(stored).not.toHaveProperty("receiptContent")
    expect(stored).not.toHaveProperty("userId")

    await page.getByRole("link", { name: "Editar Câmera revisada" }).click()
    await page.getByRole("button", { name: "Remover", exact: true }).click()
    await expect(page.getByText("O comprovante será removido ao salvar.")).toBeVisible()
    await page.getByRole("button", { name: "Salvar alterações", exact: true }).click()
    await expect(page.getByText("Nenhum comprovante anexado.")).toBeVisible()
    expect((await page.request.get(`/api/produtos/${id}/comprovante`)).status()).toBe(404)
  })

  await test.step("Confere responsividade, confirmação e exclusão com cache atualizado", async () => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.getByRole("link", { name: "Voltar para Meus produtos" }).click()
    await expect(page.getByRole("link", { name: "Câmera revisada", exact: true })).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Produtos" })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
    await page.screenshot({ path: testInfo.outputPath("produtos-mobile.png"), fullPage: true })
    await page.getByRole("link", { name: "Novo produto" }).click()
    await expect(page.getByLabel("Data da compra")).toBeVisible()
    await expect(page.getByLabel("Nome do produto")).toHaveValue("")
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
    await page.getByRole("button", { name: "Cancelar" }).click()
    await page.getByRole("button", { name: "Excluir Câmera revisada" }).click()
    await expect(page.getByRole("alertdialog", { name: "Excluir produto?" })).toBeVisible()
    await page.getByRole("button", { name: "Cancelar" }).click()
    await expect(page.getByRole("link", { name: "Câmera revisada", exact: true })).toBeVisible()
    await page.getByRole("button", { name: "Excluir Câmera revisada" }).click()
    await page.getByRole("button", { name: "Excluir produto", exact: true }).click()
    await expect(page.getByText("Produto excluído.")).toBeVisible()
    await expect(page.getByRole("link", { name: "Câmera revisada", exact: true })).toHaveCount(0)
    expect((await page.request.get(`/api/produtos/${id}`)).status()).toBe(404)
  })

  await test.step("Permite tentar novamente, mostra 404 e trata sessão expirada", async () => {
    const endpoint = "**/api/produtos"
    await page.route(endpoint, (route) => route.fulfill({ status: 500, json: { message: "Falha temporária no teste." } }))
    await page.reload()
    await expect(page.getByRole("alert").filter({ hasText: "Falha temporária no teste." })).toBeVisible()
    await page.unroute(endpoint)
    await page.getByRole("button", { name: "Tentar novamente" }).click()
    await expect(page.getByText("2 produtos encontrados")).toBeVisible()

    await page.goto("/pagina-inexistente")
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible()

    await page.route(endpoint, async (route) => {
      await page.context().clearCookies()
      await route.fulfill({ response: await page.request.get("/api/produtos") })
    })
    await page.goto("/produtos")
    await expect(page).toHaveURL(/\/login\?expirada=1$/)
    await expect(page.getByRole("status").filter({ hasText: "Sua sessão expirou. Entre novamente para continuar." })).toBeVisible()
    await expect(page.getByText(formatDate(data.purchaseDate), { exact: true }).filter({ visible: true })).toHaveCount(0)
  })
})
