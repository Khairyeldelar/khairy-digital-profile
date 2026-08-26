import { describe, expect, it } from "vitest";
import { getInitialTheme, shouldPersistTheme } from "./themePreference";

describe("theme preference", () => {
  it("uses the URL preview without persisting it", () => {
    expect(getInitialTheme("?theme=dark", "light")).toBe("dark");
    expect(shouldPersistTheme("?theme=dark")).toBe(false);
  });

  it("restores saved theme on a normal visit", () => {
    expect(getInitialTheme("", "dark")).toBe("dark");
    expect(getInitialTheme("", "invalid")).toBe("light");
    expect(shouldPersistTheme("")).toBe(true);
  });
});
