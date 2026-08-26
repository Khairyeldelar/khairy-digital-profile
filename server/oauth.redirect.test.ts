import { describe, expect, it } from "vitest";
import { getSafeReturnPath } from "./_core/oauth";

describe("OAuth return path", () => {
  it("preserves safe internal admin paths", () => {
    expect(getSafeReturnPath("/admin")).toBe("/admin");
    expect(getSafeReturnPath("/admin?tab=projects#upload")).toBe("/admin?tab=projects#upload");
  });

  it("falls back to home for unsafe or missing paths", () => {
    expect(getSafeReturnPath(undefined)).toBe("/");
    expect(getSafeReturnPath("https://evil.example")).toBe("/");
    expect(getSafeReturnPath("//evil.example")).toBe("/");
    expect(getSafeReturnPath("/\\evil.example")).toBe("/");
  });
});
