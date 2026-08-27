import { describe, expect, it } from "vitest";
import { buildSocialShareLinks, selectRelatedArticles } from "./articlePageExtras";

describe("article page extras", () => {
  const articles = [
    { id: 1, title: "Battery tips", category: "tutorials" },
    { id: 2, title: "Phone privacy", category: "tutorials" },
    { id: 3, title: "Notes app", category: "applications" },
  ];

  it("selects other items from the same category and excludes the current article", () => {
    expect(selectRelatedArticles(articles, articles[0]!)).toEqual([articles[1]]);
  });

  it("builds encoded share URLs for supported social networks", () => {
    const links = buildSocialShareLinks("https://example.com/article/battery tips", "Battery tips");

    expect(links.facebook).toContain("https%3A%2F%2Fexample.com%2Farticle%2Fbattery%20tips");
    expect(links.linkedin).toContain("https%3A%2F%2Fexample.com%2Farticle%2Fbattery%20tips");
    expect(links.x).toContain("text=Battery%20tips");
  });
});
