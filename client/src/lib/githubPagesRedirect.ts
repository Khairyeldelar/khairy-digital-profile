const REDIRECT_PARAM = "gh-pages-route";

export function restoreGithubPagesRoute(search: string, basePath: string) {
  if (basePath === "/") return null;

  const encodedRoute = new URLSearchParams(search).get(REDIRECT_PARAM);
  if (!encodedRoute || !encodedRoute.startsWith("/") || encodedRoute.startsWith("//")) return null;

  const route = new URL(encodedRoute, "https://khairy.local");
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const pathname = `${normalizedBase}${route.pathname.replace(/^\//, "")}`;

  return `${pathname}${route.search}${route.hash}`;
}
