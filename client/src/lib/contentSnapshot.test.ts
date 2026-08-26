import { describe, expect, it } from "vitest";
import { contentSnapshotPath, isStandaloneSite } from "./contentSnapshot";

describe("standalone content snapshot paths", () => {
  it("recognizes the GitHub Pages subpath as a standalone build", () => {
    expect(isStandaloneSite("/khairy-digital-profile/")).toBe(true);
    expect(isStandaloneSite("/")).toBe(false);
  });

  it("builds the content snapshot path beneath the site base", () => {
    expect(contentSnapshotPath("/khairy-digital-profile/")).toBe("/khairy-digital-profile/content-sync/site-content.json");
    expect(contentSnapshotPath("/")).toBe("/content-sync/site-content.json");
  });
});
