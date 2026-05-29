import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_CUSTOM_DOMAIN = process.env.R2_PUBLIC_CUSTOM_DOMAIN;

export const isR2Configured = !!(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME
);

const s3Client = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadImage(
  file: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  if (!s3Client || !R2_BUCKET_NAME) {
    throw new Error("R2 is not configured");
  }

  const key = `recipes/${Date.now()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  if (R2_PUBLIC_CUSTOM_DOMAIN) {
    return `${R2_PUBLIC_CUSTOM_DOMAIN}/${key}`;
  }

  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!s3Client || !R2_BUCKET_NAME) {
    throw new Error("R2 is not configured");
  }

  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `tmp/${uniqueId}-${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  let publicUrl: string;
  if (R2_PUBLIC_CUSTOM_DOMAIN) {
    publicUrl = `${R2_PUBLIC_CUSTOM_DOMAIN}/${key}`;
  } else {
    publicUrl = `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  }

  return { uploadUrl, publicUrl, key };
}

export async function persistR2Image(tmpKey: string): Promise<string> {
  if (!s3Client || !R2_BUCKET_NAME) {
    throw new Error("R2 is not configured");
  }

  if (!tmpKey.startsWith("tmp/")) {
    const key = tmpKey;
    if (R2_PUBLIC_CUSTOM_DOMAIN) {
      return `${R2_PUBLIC_CUSTOM_DOMAIN}/${key}`;
    }
    return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  }

  const cleanKey = tmpKey.substring(4); // remove "tmp/"
  const targetKey = `images/${cleanKey}`;

  await s3Client.send(
    new CopyObjectCommand({
      Bucket: R2_BUCKET_NAME,
      CopySource: encodeURIComponent(`${R2_BUCKET_NAME}/${tmpKey}`),
      Key: targetKey,
    }),
  );

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: tmpKey,
      }),
    );
  } catch (err) {
    console.error("Failed to delete temp R2 object:", err);
  }

  if (R2_PUBLIC_CUSTOM_DOMAIN) {
    return `${R2_PUBLIC_CUSTOM_DOMAIN}/${targetKey}`;
  }

  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${targetKey}`;
}

export function extractR2KeyFromUrl(url: string): string | null {
  if (!url) return null;
  if (R2_PUBLIC_CUSTOM_DOMAIN && url.includes(R2_PUBLIC_CUSTOM_DOMAIN)) {
    const parts = url.split(`${R2_PUBLIC_CUSTOM_DOMAIN}/`);
    return parts[1] || null;
  }
  if (
    R2_ACCOUNT_ID &&
    R2_BUCKET_NAME &&
    url.includes(`${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`)
  ) {
    const parts = url.split(
      `${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
    );
    return parts[1] || null;
  }
  return null;
}
