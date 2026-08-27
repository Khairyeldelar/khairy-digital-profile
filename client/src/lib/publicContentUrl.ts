const FALLBACK_CONTENT_URL = "https://khairyeldelar.github.io/khairy-digital-profile/";

export function publicContentUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : FALLBACK_CONTENT_URL;
  } catch {
    return FALLBACK_CONTENT_URL;
  }
}
