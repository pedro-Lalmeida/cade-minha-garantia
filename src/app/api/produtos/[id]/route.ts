import { ApiError, apiUserId, checkRequestOrigin, handleApiError, privateJson } from "@/lib/api"
import { connectMongo } from "@/lib/mongodb"
import { readProductRequest } from "@/lib/product-request"
import { findProduct, productDto, productScope } from "@/lib/products"
import { ProductModel } from "@/models/product"
import { productVersionHeader } from "@/types/product"

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  try {
    const userId = await apiUserId()
    const product = await findProduct(userId, (await params).id)
    if (!product) throw new ApiError(404, "Produto não encontrado.")
    return privateJson(product)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const userId = await apiUserId()
    checkRequestOrigin(request)
    const scope = productScope(userId, (await params).id)
    const versionHeader = request.headers.get(productVersionHeader)
    const version = Number(versionHeader)
    if (!versionHeader || !/^\d+$/.test(versionHeader) || !Number.isSafeInteger(version) || version >= Number.MAX_SAFE_INTEGER) {
      throw new ApiError(400, "Informe uma versão válida do produto para salvar a edição.")
    }
    // Produtos antigos sem __v começam na versão zero.
    const expected = version === 0
      ? { $or: [{ __v: 0 }, { __v: { $exists: false } }] }
      : { __v: version }

    const { fields, attachment, removeReceipt } = await readProductRequest(request, true)
    const set = { ...fields, ...attachment }
    const unset: Record<string, 1> = {}
    for (const key of ["brand", "purchasePrice", "store"] as const) {
      if (set[key] !== undefined) continue
      delete set[key]
      unset[key] = 1
    }
    if (removeReceipt) {
      unset.receipt = 1
      unset.receiptContent = 1
    }

    await connectMongo()
    const product = await ProductModel.findOneAndUpdate({ ...scope, ...expected }, {
      $set: set,
      $unset: unset,
      $inc: { __v: 1 },
    }, { returnDocument: "after", runValidators: true }).lean()
    if (!product) {
      if (!await ProductModel.exists(scope)) throw new ApiError(404, "Produto não encontrado.")
      throw new ApiError(409, "Este produto foi alterado por outra operação. Recarregue os dados para continuar.")
    }
    return privateJson(productDto(product))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const userId = await apiUserId()
    checkRequestOrigin(request)
    const scope = productScope(userId, (await params).id)
    await connectMongo()
    const result = await ProductModel.deleteOne(scope)
    if (!result.deletedCount) throw new ApiError(404, "Produto não encontrado.")
    return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return handleApiError(error)
  }
}
