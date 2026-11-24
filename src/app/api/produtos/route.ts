import { apiUserId, checkRequestOrigin, handleApiError, privateJson } from "@/lib/api"
import { connectMongo } from "@/lib/mongodb"
import { readProductRequest } from "@/lib/product-request"
import { productDto } from "@/lib/products"
import { ProductModel } from "@/models/product"

export async function GET() {
  try {
    const userId = await apiUserId()
    await connectMongo()
    const products = await ProductModel.find({ userId }).sort({ createdAt: -1 }).lean()
    return privateJson(products.map(productDto))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const userId = await apiUserId()
    checkRequestOrigin(request)
    const { fields, attachment } = await readProductRequest(request)
    await connectMongo()
    const product = await ProductModel.create({ ...fields, ...attachment, userId })
    return privateJson(productDto(product), 201)
  } catch (error) {
    return handleApiError(error)
  }
}
