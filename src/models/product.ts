import { Schema, model, models, type Model, type Types } from "mongoose"
import { categories, type ProductInput, type Receipt } from "@/types/product"

export type ProductRecord = Omit<ProductInput, "purchaseDate"> & {
  _id: Types.ObjectId
  userId: Types.ObjectId
  purchaseDate: Date
  receipt?: Receipt
  receiptContent?: Buffer
  createdAt: Date
  updatedAt: Date
}

const receiptSchema = new Schema<Receipt>({
  name: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, min: 1 },
}, { _id: false })

const schema = new Schema<ProductRecord>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  name: { type: String, required: true },
  brand: String,
  category: { type: String, required: true, enum: categories },
  purchaseDate: { type: Date, required: true },
  purchasePrice: { type: Number, min: 0 },
  store: String,
  warrantyMonths: { type: Number, required: true, min: 1, validate: Number.isInteger },
  receipt: receiptSchema,
  receiptContent: { type: Buffer, select: false },
}, { timestamps: true })

schema.index({ userId: 1, createdAt: -1 })

export const ProductModel = (models.Product as Model<ProductRecord> | undefined) ??
  model<ProductRecord>("Product", schema)
