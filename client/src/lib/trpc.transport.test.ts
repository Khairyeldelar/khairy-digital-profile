import { afterEach, describe, expect, it } from "vitest";
import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import { getSessionHandoffAuthorization } from "./sessionHandoff";

const originalSessionStorage = globalThis.sessionStorage;

afterEach(() => {
  Object.assign(globalThis, { sessionStorage: originalSessionStorage });
});

describe("tRPC mobile session transport", () => {
  it("forwards the stored handoff token through the real HTTP link", async () => {
    const values = new Map([["manus-cookie", "app_session_id=signed-token"]]);
    Object.assign(globalThis, {
      sessionStorage: { getItem: (key: string) => values.get(key) ?? null },
    });
    let capturedHeaders: Headers | undefined;
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify([{ result: { data: { json: null } } }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };
    const client = trpc.createClient({
      links: [
        httpBatchLink({
          url: "https://example.test/api/trpc",
          transformer: superjson,
          headers: getSessionHandoffAuthorization,
          fetch: fetcher,
        }),
      ],
    });

    await client.auth.me.query();

    expect(capturedHeaders?.get("authorization")).toBe("Bearer signed-token");
  });
});
