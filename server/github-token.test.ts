import { describe, expect, it } from "vitest";

describe("GitHub token configuration", () => {
  it("authenticates with GitHub without exposing the token", async () => {
    const token = process.env.GITHUB_TOKEN;
    expect(token, "GITHUB_TOKEN must be configured for GitHub sync").toBeTruthy();

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "khairy-digital-profile-sync",
      },
    });

    expect(response.ok).toBe(true);
  }, 15_000);
});
