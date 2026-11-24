import { hash } from "bcryptjs"
import { ApiError, checkRequestOrigin, handleApiError, invalidFields, privateJson } from "@/lib/api"
import { connectMongo } from "@/lib/mongodb"
import { UserModel } from "@/models/user"
import { registerSchema } from "@/validations/auth"

export async function POST(request: Request) {
  try {
    checkRequestOrigin(request)
    const parsed = registerSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) throw invalidFields(parsed.error)
    const { name, email, password } = parsed.data
    await connectMongo()
    await UserModel.init()
    if (await UserModel.exists({ email })) throw new ApiError(409, "Já existe uma conta com esse e-mail.")
    const passwordHash = await hash(password, 12)
    await UserModel.create({ name, email, passwordHash })
    return privateJson({ message: "Conta criada com sucesso." }, 201)
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return handleApiError(new ApiError(409, "Já existe uma conta com esse e-mail."))
    }
    return handleApiError(error)
  }
}
