import { sanitizeFileName } from "@/lib/normalizers";

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXTENSIONS = [".xlsx", ".xml"] as const;
const XLSX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
  "",
]);
const XML_MIME_TYPES = new Set(["application/xml", "text/xml", ""]);

export function validateUploadFile(file: File, allowed: readonly string[] = ALLOWED_UPLOAD_EXTENSIONS) {
  const safeName = sanitizeFileName(file.name || "upload");
  const lowerName = safeName.toLowerCase();
  const extension = allowed.find((item) => lowerName.endsWith(item));
  if (!extension) return { ok: false as const, errorCode: "file.extension.invalid", safeName };
  if (file.size <= 0) return { ok: false as const, errorCode: "file.empty", safeName };
  if (file.size > MAX_UPLOAD_SIZE) return { ok: false as const, errorCode: "file.size.exceeded", safeName };
  if (extension === ".xlsx" && !XLSX_MIME_TYPES.has(file.type)) return { ok: false as const, errorCode: "file.mime.invalid", safeName };
  if (extension === ".xml" && !XML_MIME_TYPES.has(file.type)) return { ok: false as const, errorCode: "file.mime.invalid", safeName };
  return { ok: true as const, extension, safeName };
}
