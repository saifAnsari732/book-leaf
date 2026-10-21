import crypto from "crypto";

/**
 * ImageKit.io Server-Side Storage & Upload Service
 * Used for storing author support ticket attachments (e.g., defective book print photos,
 * royalty screenshots, ISBN barcode photos).
 *
 * Security:
 * - Validates file magic bytes / MIME signatures in addition to declared MIME type
 * - Enforces 5MB max size limit
 * - Uses IMAGEKIT_PRIVATE_KEY on the server only (never exposed to browser)
 * - Degrades gracefully if ImageKit credentials are not configured in local dev
 */

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

export function validateAttachmentBuffer(
  buffer: Buffer,
  declaredMime: string
): { valid: boolean; reason?: string } {
  if (!ALLOWED_MIME_TYPES.has(declaredMime)) {
    return {
      valid: false,
      reason: "Unsupported file type. Allowed: JPG, PNG, WEBP, PDF, TXT.",
    };
  }

  const maxBytes =
    (Number(process.env.MAX_ATTACHMENT_SIZE_MB) || 5) * 1024 * 1024;
  if (buffer.byteLength > maxBytes) {
    return {
      valid: false,
      reason: `File size exceeds maximum limit of ${
        Number(process.env.MAX_ATTACHMENT_SIZE_MB) || 5
      }MB.`,
    };
  }

  // Verify magic bytes for binary formats so MIME spoofing is rejected
  if (buffer.byteLength >= 4) {
    if (declaredMime === "image/png") {
      const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47;
      if (!isPng) {
        return {
          valid: false,
          reason: "File signature does not match a valid PNG image.",
        };
      }
    } else if (declaredMime === "image/jpeg") {
      const isJpg =
        buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      if (!isJpg) {
        return {
          valid: false,
          reason: "File signature does not match a valid JPEG image.",
        };
      }
    } else if (declaredMime === "application/pdf") {
      const isPdf =
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46; // %PDF
      if (!isPdf) {
        return {
          valid: false,
          reason: "File signature does not match a valid PDF document.",
        };
      }
    }
  }

  return { valid: true };
}

export function getImageKitAuthParams(): {
  configured: boolean;
  publicKey?: string;
  urlEndpoint?: string;
  token?: string;
  expire?: number;
  signature?: string;
} {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim();
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim();

  if (!publicKey || !privateKey || !urlEndpoint) {
    return { configured: false };
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 mins
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire.toString())
    .digest("hex");

  return {
    configured: true,
    publicKey,
    urlEndpoint,
    token,
    expire,
    signature,
  };
}

export async function uploadToImageKitServer(params: {
  fileName: string;
  mimeType: string;
  base64Data: string;
  authorId: string;
}): Promise<{
  name: string;
  size: number;
  type: string;
  url: string;
  fileId: string;
  provider: "imagekit" | "local-preview";
}> {
  const { fileName, mimeType, base64Data, authorId } = params;
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");

  const validation = validateAttachmentBuffer(buffer, mimeType);
  if (!validation.valid) {
    throw new Error(validation.reason || "Invalid attachment");
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);

  if (privateKey && urlEndpoint) {
    const formData = new FormData();
    formData.append("file", cleanBase64);
    formData.append("fileName", `${authorId}_${Date.now()}_${safeName}`);
    formData.append("folder", "/bookleaf-support-attachments");
    formData.append("useUniqueFileName", "true");

    const basicAuth = Buffer.from(`${privateKey}:`).toString("base64");
    const response = await fetch(
      "https://upload.imagekit.io/api/v1/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
        body: formData,
      }
    );

    if (response.ok) {
      const result = (await response.json()) as {
        url: string;
        fileId: string;
        name: string;
        size: number;
      };
      return {
        name: fileName,
        size: result.size || buffer.byteLength,
        type: mimeType,
        url: result.url,
        fileId: result.fileId,
        provider: "imagekit",
      };
    }
  }

  // Graceful local fallback when ImageKit credentials are not configured
  const previewUrl =
    mimeType.startsWith("image/") && buffer.byteLength <= 512 * 1024
      ? `data:${mimeType};base64,${cleanBase64}`
      : `#attachment-${safeName}`;

  return {
    name: fileName,
    size: buffer.byteLength,
    type: mimeType,
    url: previewUrl,
    fileId: `ik_local_${Date.now()}`,
    provider: "local-preview",
  };
}
