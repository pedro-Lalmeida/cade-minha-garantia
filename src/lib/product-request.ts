import { productSchema } from "@/validations/product"
import { receiptLimit, validateReceiptFile } from "@/validations/receipt"
import { validReceiptContent } from "./receipt-content"
import { ApiError, invalidFields } from "./api"

export async function readProductRequest(request: Request, editing = false) {
  const limit = receiptLimit + 64 * 1024
  const tooLarge = new ApiError(413, "O comprovante deve ter até 4 MB.")
  if (Number(request.headers.get("content-length")) > limit) throw tooLarge
  let size = 0
  const body = request.body?.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.byteLength
      if (size > limit) throw tooLarge
      controller.enqueue(chunk)
    },
  }))

  let form: FormData
  let input: unknown
  try {
    form = await new Response(body, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData()
    const data = form.get("product")
    if (typeof data !== "string") throw new Error()
    input = JSON.parse(data)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(400, "Dados do produto inválidos.")
  }

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) throw invalidFields(parsed.error)
  const { purchaseDate, ...values } = parsed.data

  const file = form.get("receipt")
  const removeReceipt = editing && form.get("removeReceipt") === "true"
  const fields = { ...values, purchaseDate: new Date(purchaseDate) }
  if (file === null) return { fields, removeReceipt }

  if (!(file instanceof File) || removeReceipt) throw new ApiError(400, "Seleção de comprovante inválida.")
  const message = validateReceiptFile(file)
  if (message) throw new ApiError(422, message, { receipt: [message] })

  const receiptContent = Buffer.from(await file.arrayBuffer())
  if (!await validReceiptContent(receiptContent, file.type)) {
    const message = "O conteúdo do arquivo não corresponde ao formato informado ou está inválido. Use um PDF sem senha ou uma imagem válida."
    throw new ApiError(422, message, { receipt: [message] })
  }

  return { fields, removeReceipt: false, attachment: {
    receipt: { name: file.name, mimeType: file.type, size: file.size },
    receiptContent,
  } }
}
