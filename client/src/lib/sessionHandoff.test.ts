import { afterEach, describe, expect, it } from "vitest";
import { consumeMobileSessionHandoff, getSessionHandoffAuthorization } from "./sessionHandoff";

const originalWindow = globalThis.window;
const originalSessionStorage = globalThis.sessionStorage;

function installBrowserState(hash: string) {
  const values = new Map<string, string>();
  Object.assign(globalThis, {
    window: {
      location: { hash, pathname: "/admin", search: "?tab=content" },
      history: { replaceState: (_state: unknown, _title: string, url: string) => { (globalThis.window as any).location.hash = ""; (globalThis.window as any).cleanUrl = url; } },
    },
    sessionStorage: {
      setItem: (key: string, value: string) => values.set(key, value),
      getItem: (key: string) => values.get(key) ?? null,
    },
    document: { title: "Admin" },
  });
}

afterEach(() => {
  Object.assign(globalThis, { window: originalWindow, sessionStorage: originalSessionStorage });
});

describe("mobile OAuth session handoff", () => {
  it("stores the fragment token, removes the hash, and creates the bearer header", () => {
    installBrowserState("#session=signed-token");
    consumeMobileSessionHandoff();
    expect((globalThis.window as any).cleanUrl).toBe("/admin?tab=content");
    expect(getSessionHandoffAuthorization()).toEqual({ Authorization: "Bearer signed-token" });
  });
});
