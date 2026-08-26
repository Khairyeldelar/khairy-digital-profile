import { COOKIE_NAME } from "@shared/const";

export function consumeMobileSessionHandoff(): void {
  if (typeof window === "undefined") return;
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get("session");
  if (!token) return;
  try {
    sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${token}`);
  } catch {
    // If storage is unavailable, the regular cookie flow remains available.
  }
  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}`
  );
}

export function getSessionHandoffAuthorization(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    if (!raw) return {};
    const prefix = `${COOKIE_NAME}=`;
    const pair = raw.split(";").find(value => value.trim().startsWith(prefix));
    const token = pair?.trim().slice(prefix.length);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
