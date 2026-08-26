export function publicAssetPath(assetPath: string, base = import.meta.env.BASE_URL || "/") {
  return `${base}${assetPath.replace(/^\/+/, "")}`;
}

export function resolveProjectImage(key?: string | null, signedUrl?: string | null, base = import.meta.env.BASE_URL || "/") {
  if (signedUrl) return signedUrl;
  if (!key || base !== "/") return "";
  return key.startsWith("/manus-storage/") ? key : `/manus-storage/${key}`;
}
