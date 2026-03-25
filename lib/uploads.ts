import { storeUploadedFile } from "@/lib/storage";

const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedDocumentMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function assertAllowedImage(file: File) {
  if (!allowedImageMimeTypes.includes(file.type)) {
    throw new Error("Format image non supporté. Utilisez JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image trop lourde. Maximum 10 Mo.");
  }
}

export function assertAllowedDocument(file: File) {
  if (!allowedDocumentMimeTypes.includes(file.type)) {
    throw new Error("Document non supporté. Utilisez PDF, image, DOC, DOCX ou TXT.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Document trop lourd. Maximum 20 Mo.");
  }
}

export async function saveUploadedFile(params: {
  file: File;
  agencyId: string;
  bucket: "property-media" | "documents";
  folder?: string;
}) {
  return storeUploadedFile(params);
}
