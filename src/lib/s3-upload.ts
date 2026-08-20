import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_BASE_URL = "https://echo.oqens.me";
const DEFAULT_CDN_URL = "https://media.friendlydrop.in";

function oqensConfig() {
  const apiKey = process.env["OQENS_API_KEY"];
  if (!apiKey) throw new Error("OQENS_API_KEY is not configured on the server.");
  return { apiKey, baseUrl: process.env["OQENS_BASE_URL"] || DEFAULT_BASE_URL, cdnUrl: process.env["OQENS_CDN_URL"] || DEFAULT_CDN_URL };
}

const uploadInput = z.object({ key: z.string().min(1).max(500), contentType: z.string().startsWith("image/").max(100), body: z.string().min(1) });

export const uploadToOqens = createServerFn({ method: "POST" }).inputValidator(uploadInput).handler(async ({ data }) => {
  const config = oqensConfig();
  const bytes = Uint8Array.from(atob(data.body), (character) => character.charCodeAt(0));
  const form = new FormData();
  form.append("file", new File([bytes], data.key, { type: data.contentType }));
  const response = await fetch(`${config.baseUrl}/api/bucket/upload`, { method: "POST", headers: { "X-API-Key": config.apiKey }, body: form });
  if (!response.ok) throw new Error(`OQENS upload failed (${response.status}).`);
  return { key: data.key, url: `${config.cdnUrl}/${data.key}` };
});

const deleteInput = z.object({ key: z.string().min(1).max(500) });
export const deleteFromOqens = createServerFn({ method: "POST" }).inputValidator(deleteInput).handler(async ({ data }) => {
  const config = oqensConfig();
  const response = await fetch(`${config.baseUrl}/api/bucket/delete`, { method: "DELETE", headers: { "X-API-Key": config.apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ key: data.key }) });
  if (!response.ok) throw new Error(`OQENS delete failed (${response.status}).`);
  return { key: data.key };
});

export async function uploadImageToOqens(file: File, folder: "avatars" | "activities" | "communities" | "resources", userId: string) {
  if (!file.type.startsWith("image/")) throw new Error("Only image files can be uploaded.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be smaller than 10 MB.");
  const name = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const key = `${folder}/${userId}/${crypto.randomUUID()}-${name}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return uploadToOqens({ data: { key, contentType: file.type, body: btoa(binary) } });
}

/** Compatibility alias while existing callers migrate from the old S3 name. */
export const uploadImageToS3 = uploadImageToOqens;
