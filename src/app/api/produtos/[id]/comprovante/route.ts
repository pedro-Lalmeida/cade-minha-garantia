import { ApiError, apiUserId, handleApiError } from "@/lib/api"
import { connectMongo } from "@/lib/mongodb"
import { productScope } from "@/lib/products"
import { ProductModel } from "@/models/product"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const userId = await apiUserId()
    const scope = productScope(userId, (await params).id)
    await connectMongo()
    const product = await ProductModel.findOne(scope).select("receipt +receiptContent")
    const receipt = product?.receipt
    const content = product?.receiptContent
    if (!receipt || !content) throw new ApiError(404, "Comprovante não encontrado.")

    const download = new URL(request.url).searchParams.get("download") === "1"
    const filename = encodeURIComponent(receipt.name.toWellFormed()).replace(/['()*]/g, (char) =>
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    return new Response(Uint8Array.from(content), { headers: {
      "Content-Type": receipt.mimeType,
      "Content-Length": String(content.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
    } })
  } catch (error) {
    return handleApiError(error)
  }
}
