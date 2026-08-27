import { describe, expect, it } from "vitest";
import { restoreGithubPagesRoute } from "./githubPagesRedirect";

describe("restoreGithubPagesRoute", () => {
  it("restores an encoded article route below the repository base path", () => {
    expect(restoreGithubPagesRoute("?gh-pages-route=%2Farticle%2FCan%2520You%2520Survive", "/khairy-digital-profile/")).toBe("/khairy-digital-profile/article/Can%20You%20Survive");
  });

  it("retains query parameters and anchors from the requested article URL", () => {
    expect(restoreGithubPagesRoute("?gh-pages-route=%2Farticle%2FGuide%3Flang%3Dar%23rating", "/khairy-digital-profile/")).toBe("/khairy-digital-profile/article/Guide?lang=ar#rating");
  });

  it("ignores missing, root-build, and protocol-relative redirect values", () => {
    expect(restoreGithubPagesRoute("", "/khairy-digital-profile/")).toBeNull();
    expect(restoreGithubPagesRoute("?gh-pages-route=%2F%2Fevil.example", "/khairy-digital-profile/")).toBeNull();
    expect(restoreGithubPagesRoute("?gh-pages-route=%2Farticle%2FGuide", "/")).toBeNull();
  });
});
