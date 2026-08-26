import { describe, expect, it } from "vitest";
import { presentSocialLink } from "./socialLinkPresentation";

describe("presentSocialLink", () => {
  const link = {
    platform: "custom-1",
    platformEn: "Behance",
    platformAr: "بيهانس",
    handleEn: "Selected work",
    handleAr: "أعمال مختارة",
    href: "https://behance.net/khairy",
  };

  it("presents bilingual platform names and descriptions", () => {
    const presented = presentSocialLink(link);
    expect(presented.name).toBe("Behance");
    expect(presented.nameAr).toBe("بيهانس");
    expect(presented.handle).toBe("Selected work");
    expect(presented.handleAr).toBe("أعمال مختارة");
  });

  it("uses a mail icon fallback for an arbitrary platform", () => {
    const presented = presentSocialLink(link);
    expect(presented.icon.displayName || presented.icon.name).toMatch(/Mail/i);
  });
});
