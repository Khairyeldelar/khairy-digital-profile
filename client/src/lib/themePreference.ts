export type ThemePreference = "light" | "dark";

export function getInitialTheme(search: string, savedTheme: string | null, defaultTheme: ThemePreference = "light"): ThemePreference {
  const previewTheme = new URLSearchParams(search).get("theme");
  if (previewTheme === "dark" || previewTheme === "light") return previewTheme;
  return savedTheme === "dark" || savedTheme === "light" ? savedTheme : defaultTheme;
}

export function shouldPersistTheme(search: string): boolean {
  const previewTheme = new URLSearchParams(search).get("theme");
  return previewTheme !== "dark" && previewTheme !== "light";
}
