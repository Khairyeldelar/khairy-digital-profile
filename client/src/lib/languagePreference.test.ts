import { describe, expect, it } from "vitest";
import { getInitialProfileLanguage, shouldPersistProfileLanguage } from "./languagePreference";

describe("profile language preference", () => {
  it("keeps query previews transient and defaults a plain visit to Arabic", () => {
    expect(getInitialProfileLanguage("?lang=en", null)).toBe("en");
    expect(shouldPersistProfileLanguage("?lang=en")).toBe(false);
    expect(getInitialProfileLanguage("", null)).toBe("ar");
    expect(getInitialProfileLanguage("", "en")).toBe("en");
    expect(shouldPersistProfileLanguage("")).toBe(true);
  });
});
