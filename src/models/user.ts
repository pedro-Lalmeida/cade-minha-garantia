import { Schema, model, models, type Model } from "mongoose"

type User = {
  name: string
  email: string
  passwordHash: string
}

const schema = new Schema<User>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true })

export const UserModel = (models.User as Model<User> | undefined) ?? model<User>("User", schema)
