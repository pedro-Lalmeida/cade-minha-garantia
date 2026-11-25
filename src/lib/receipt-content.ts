import { PDFDocument } from "pdf-lib"
import sharp from "sharp"
import { matchesReceiptSignature } from "../validations/receipt.ts"

const imagePixelLimit = 32_000_000

async function validPdf(data: Buffer) {
  const tail = data.subarray(-2048).toString("latin1")
  const trailer = /startxref\s+(\d+)\s+%%EOF[\x00\t\n\f\r ]*$/.exec(tail)
  if (!trailer) return false

  const offset = Number(trailer[1])
  if (!Number.isSafeInteger(offset) || offset <= 0 || offset >= data.length) return false
  const crossReference = data.toString("latin1", offset, offset + 64)
  if (!/^(?:xref\s|\d+\s+\d+\s+obj\b)/.test(crossReference)) return false

  const document = await PDFDocument.load(data, { throwOnInvalidObject: true, updateMetadata: false })
  return document.getPageCount() > 0
}

export async function validReceiptContent(data: Buffer, mimeType: string) {
  if (!matchesReceiptSignature(data, mimeType)) return false

  try {
    if (mimeType === "application/pdf") return await validPdf(data)
    const image = sharp(data, { failOn: "warning", limitInputPixels: imagePixelLimit })
    const expected = mimeType === "image/png" ? "png" : "jpeg"
    if ((await image.metadata()).format !== expected) return false
    // Statistics require decoding the image pixels, unlike reading metadata.
    await image.stats()
    return true
  } catch {
    return false
  }
}
