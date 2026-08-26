import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerOAuthRoutes } from "./_core/oauth";
import { appRouter } from "./routers";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import * as db from "./db";

function makeResponse() {
  return {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    redirect: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe("OAuth callback session persistence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sets the session cookie and returns the owner to /admin", async () => {
    const route = vi.fn();
    registerOAuthRoutes({ get: route } as never);
    const callback = route.mock.calls[0][1] as (req: unknown, res: ReturnType<typeof makeResponse>) => Promise<void>;
    const res = makeResponse();

    vi.spyOn(sdk, "exchangeCodeForToken").mockResolvedValue({ accessToken: "access-token" } as never);
    vi.spyOn(sdk, "getUserInfo").mockResolvedValue({
      openId: ENV.ownerOpenId,
      name: "Khairy Eid Aly",
      email: "khairy@example.com",
      loginMethod: "test",
    } as never);
    vi.spyOn(sdk, "createSessionToken").mockResolvedValue("signed-session-token");
    vi.spyOn(db, "upsertUser").mockResolvedValue(undefined as never);

    const nonce = "nonce-123";
    const state = btoa(JSON.stringify({
      redirectUri: "https://khairydigi-ervsguee.manus.space/api/oauth/callback",
      nonce,
      returnPath: "/admin",
    }));
    const req = {
      query: { code: "oauth-code", state },
      headers: { cookie: `__Host-oauth_state=${nonce}`, "x-forwarded-proto": "https" },
      protocol: "http",
    };

    await callback(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "app_session_id",
      "signed-session-token",
      expect.objectContaining({ httpOnly: true, sameSite: "none", secure: true, path: "/" })
    );
    expect(res.clearCookie).toHaveBeenCalledWith("__Host-oauth_state", expect.any(Object));
    expect(res.redirect).toHaveBeenCalledWith(302, expect.stringMatching(/^\/admin#session=.+/));
    expect(res.status).not.toHaveBeenCalled();
  });

  it("authenticates a subsequent admin request with the emitted session cookie", async () => {
    const route = vi.fn();
    registerOAuthRoutes({ get: route } as never);
    const callback = route.mock.calls[0][1] as (req: unknown, res: ReturnType<typeof makeResponse>) => Promise<void>;
    const res = makeResponse();

    vi.spyOn(sdk, "exchangeCodeForToken").mockResolvedValue({ accessToken: "access-token" } as never);
    vi.spyOn(sdk, "getUserInfo").mockResolvedValue({
      openId: ENV.ownerOpenId,
      name: "Khairy Eid Aly",
      email: "khairy@example.com",
      loginMethod: "test",
    } as never);
    vi.spyOn(db, "upsertUser").mockResolvedValue(undefined as never);
    vi.spyOn(db, "getUserByOpenId").mockResolvedValue({
      id: 1,
      openId: ENV.ownerOpenId,
      name: "Khairy Eid Aly",
      email: "khairy@example.com",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const nonce = "nonce-456";
    const state = btoa(JSON.stringify({ redirectUri: "https://example.com/api/oauth/callback", nonce, returnPath: "/admin" }));
    await callback({
      query: { code: "oauth-code", state },
      headers: { cookie: `__Host-oauth_state=${nonce}`, "x-forwarded-proto": "https" },
      protocol: "http",
    }, res);

    const sessionToken = res.cookie.mock.calls[0][1] as string;
    const authenticated = await sdk.authenticateRequest({
      headers: { cookie: `app_session_id=${sessionToken}` },
    } as never);

    expect(authenticated.openId).toBe(ENV.ownerOpenId);
    expect(authenticated.role).toBe("admin");

    const adminResult = await appRouter.createCaller({
      user: authenticated,
      req: { protocol: "https", headers: { cookie: `app_session_id=${sessionToken}` } } as never,
      res: {} as never,
    }).admin.content();
    expect(adminResult.projects).toBeInstanceOf(Array);
  });
});
