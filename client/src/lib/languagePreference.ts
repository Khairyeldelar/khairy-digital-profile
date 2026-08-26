export type ProfileLanguage = "ar" | "en";

export function getInitialProfileLanguage(search: string, savedLanguage: string | null): ProfileLanguage {
  const previewLanguage = new URLSearchParams(search).get("lang");
  if (previewLanguage === "en" || previewLanguage === "ar") return previewLanguage;
  return savedLanguage === "en" ? "en" : "ar";
}

export function shouldPersistProfileLanguage(search: string): boolean {
  const previewLanguage = new URLSearchParams(search).get("lang");
  return previewLanguage !== "en" && previewLanguage !== "ar";
}
