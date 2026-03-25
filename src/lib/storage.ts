import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

type StorageDriver = "local" | "s3";

type UploadParams = {
  file: File;
  agencyId: string;
  bucket: "property-media" | "documents";
  folder?: string;
};

type UploadResult = {
  publicUrl: string;
  fileName: string;
  mimeType: string | null;
  storageKey: string;
  storageDriver: StorageDriver;
};

const mimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "text/plain": ".txt",
};

function sanitizeSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function extensionFromFile(file: File) {
  const original = path.extname(file.name || "");
  if (original) return original.toLowerCase();
  return mimeToExtension[file.type] ?? "";
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getS3Config() {
  const bucket = process.env.STORAGE_BUCKET;
  const endpoint = process.env.STORAGE_ENDPOINT;
  const region = process.env.STORAGE_REGION || "auto";
  const accessKeyId = process.env.STORAGE_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_SECRET_KEY;
  const publicUrl = process.env.STORAGE_PUBLIC_URL;
  const forcePathStyle = process.env.STORAGE_FORCE_PATH_STYLE === "true";

  const enabled =
    process.env.STORAGE_DRIVER === "s3" &&
    Boolean(bucket) &&
    Boolean(accessKeyId) &&
    Boolean(secretAccessKey);

  return {
    enabled,
    bucket,
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    publicUrl,
    forcePathStyle,
  };
}

function buildStorageKey(params: UploadParams) {
  const { file, agencyId, bucket, folder } = params;
  const ext = extensionFromFile(file);
  const baseName = sanitizeSegment(path.basename(file.name || "file", ext)) || "file";
  const randomName = `${Date.now()}-${randomUUID()}-${baseName}${ext}`;

  return [
    sanitizeSegment(agencyId),
    bucket,
    folder ? sanitizeSegment(folder) : "root",
    randomName,
  ].join("/");
}

async function uploadToLocal(params: UploadParams, storageKey: string): Promise<UploadResult> {
  const publicRoot = path.join(process.cwd(), "public");
  const uploadRoot = path.join(publicRoot, "uploads");
  const targetPath = path.join(uploadRoot, ...storageKey.split("/"));

  await mkdir(path.dirname(targetPath), { recursive: true });

  const arrayBuffer = await params.file.arrayBuffer();
  await writeFile(targetPath, Buffer.from(arrayBuffer));

  const publicUrl = path.join("/uploads", ...storageKey.split("/")).replace(/\\/g, "/");

  return {
    publicUrl,
    fileName: params.file.name,
    mimeType: params.file.type || null,
    storageKey,
    storageDriver: "local",
  };
}

async function uploadToS3(params: UploadParams, storageKey: string): Promise<UploadResult> {
  const cfg = getS3Config();

  if (
    !cfg.enabled ||
    !cfg.bucket ||
    !cfg.accessKeyId ||
    !cfg.secretAccessKey
  ) {
    throw new Error("Configuration stockage objet incomplète.");
  }

  const client = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint || undefined,
    forcePathStyle: cfg.forcePathStyle,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  const arrayBuffer = await params.file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: storageKey,
      Body: body,
      ContentType: params.file.type || undefined,
      CacheControl: params.bucket === "property-media" ? "public, max-age=31536000, immutable" : "private, max-age=0, no-cache",
    }),
  );

  const publicUrl = cfg.publicUrl
    ? `${trimTrailingSlash(cfg.publicUrl)}/${storageKey}`
    : cfg.endpoint
      ? `${trimTrailingSlash(cfg.endpoint)}${cfg.forcePathStyle ? `/${cfg.bucket}` : ""}/${storageKey}`
      : `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${storageKey}`;

  return {
    publicUrl,
    fileName: params.file.name,
    mimeType: params.file.type || null,
    storageKey,
    storageDriver: "s3",
  };
}

export function getStorageDriver(): StorageDriver {
  return getS3Config().enabled ? "s3" : "local";
}

export async function storeUploadedFile(params: UploadParams): Promise<UploadResult> {
  const storageKey = buildStorageKey(params);

  if (getStorageDriver() === "s3") {
    return uploadToS3(params, storageKey);
  }

  return uploadToLocal(params, storageKey);
}
