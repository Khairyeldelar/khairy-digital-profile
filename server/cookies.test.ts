import { describe, expect, it, vi } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

function requestWith(headers: Record<string, string> = {}, protocol = "http") {
  return { protocol, headers } as never;
}

describe("session cookie options", () => {
  it("marks SameSite=None cookies secure for forwarded HTTPS", () => {
    expect(getSessionCookieOptions(requestWith({ "x-forwarded-proto": "https" }))).toMatchObject({
      sameSite: "none",
      secure: true,
      httpOnly: true,
      path: "/",
    });
  });

  it("marks the cookie secure in production even on an internal HTTP hop", () => {
    const previous = process.env.NODE_ENV;
    vi.stubEnv("NODE_ENV", "production");
    expect(getSessionCookieOptions(requestWith())).toMatchObject({ secure: true, sameSite: "none" });
    vi.stubEnv("NODE_ENV", previous ?? "test");
  });
});
