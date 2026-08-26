export function resolveProjectImage(key?: string | null, signedUrl?: string | null) {
  if (signedUrl) return signedUrl;
  if (!key) return "";
  return key.startsWith("/manus-storage/") ? key : `/manus-storage/${key}`;
}
