export function publicAssetPath(assetPath: string, base = import.meta.env.BASE_URL || "/") {
  return `${base}${assetPath.replace(/^\/+/, "")}`;
}

export function resolveProjectImage(key?: string | null, signedUrl?: string | null, base = import.meta.env.BASE_URL || "/") {
  if (signedUrl) return /^(?:https?:|data:|\/)/i.test(signedUrl) ? signedUrl : publicAssetPath(signedUrl, base);
  if (!key || base !== "/") return "";
  return key.startsWith("/manus-storage/") ? key : `/manus-storage/${key}`;
}

export function rewriteStaticArticleImageUrls(html: string, base = import.meta.env.BASE_URL || "/") {
  return html.replace(/(\bsrc\s*=\s*["'])(content-sync\/assets\/[^"']+)(["'])/gi, (_, prefix, source, suffix) => `${prefix}${publicAssetPath(source, base)}${suffix}`);
}
