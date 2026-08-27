import { describe, expect, it } from "vitest";
import { publicContentUrl } from "./publicContentUrl";

describe("publicContentUrl", () => {
  it("replaces an empty or incomplete optional source link with the content-page fallback", () => {
    expect(publicContentUrl("")).toBe("https://khairyeldelar.github.io/khairy-digital-profile/");
    expect(publicContentUrl("https://")).toBe("https://khairyeldelar.github.io/khairy-digital-profile/");
  });

  it("preserves valid http and https source links", () => {
    expect(publicContentUrl("https://youtube.com/watch?v=123")).toBe("https://youtube.com/watch?v=123");
  });
});
