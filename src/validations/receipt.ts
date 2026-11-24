export const receiptTypes = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
} as const

export const receiptAccept = ".pdf,.jpg,.jpeg,.png"
export const receiptLimit = 4 * 1024 * 1024

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ""
}

export function validateReceiptFile(file: File) {
  const extension = fileExtension(file.name)
  if (!Object.hasOwn(receiptTypes, extension)) return "Selecione um arquivo PDF, JPG, JPEG ou PNG."
  if (receiptTypes[extension as keyof typeof receiptTypes] !== file.type) return "O tipo do arquivo não corresponde à extensão."
  if (!file.size || file.size > receiptLimit) return "Selecione um arquivo de até 4 MB que não esteja vazio."
  if (file.name.length > 180 || /[\u0000-\u001f\u007f]/.test(file.name)) return "Use um nome de arquivo válido com até 180 caracteres."
}

const signatures: Record<string, readonly number[]> = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
}

export function matchesReceiptSignature(data: Uint8Array, mimeType: string) {
  const signature = signatures[mimeType]
  return Boolean(signature?.every((byte, index) => data[index] === byte))
}
