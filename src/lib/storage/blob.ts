import { del, put } from "@vercel/blob";
import { encryptBuffer } from "../privacy/encryption";
import { sanitizeFileName } from "../normalizers";

export async function storeEncryptedFile(input: {
  reservationId: string;
  type: "SOURCE_EXCEL" | "GENERATED_XML" | "VALIDATION_REPORT";
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN no configurado");
  const encrypted = encryptBuffer(input.buffer);
  const safeFileName = `${Date.now()}-${sanitizeFileName(input.fileName)}`;
  const blobPath = `syncxml/${input.reservationId}/${input.type.toLowerCase()}/${safeFileName}.enc`;
  const blob = await put(blobPath, encrypted.encrypted, {
    access: "private",
    contentType: "application/octet-stream",
  });
  return {
    originalFileName: input.fileName,
    safeFileName,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.byteLength,
    blobUrl: blob.url,
    blobPath,
    encrypted: true,
    encryptionIv: encrypted.iv,
    encryptionAuthTag: encrypted.authTag,
    sha256: encrypted.sha256,
  };
}

export async function deleteBlobPath(path?: string | null) {
  if (!path || !process.env.BLOB_READ_WRITE_TOKEN) return;
  await del(path);
}
