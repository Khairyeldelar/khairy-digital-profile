import { describe, expect, it } from "vitest";
import { getAdminNotice, type AdminNoticeAction } from "./adminNotifications";

const actions: AdminNoticeAction[] = [
  "assetUpload",
  "profileSave",
  "projectCreate",
  "projectUpdate",
  "projectDelete",
  "projectImageUpload",
  "socialUpdate",
];

describe("admin notifications", () => {
  it("provides a distinct success and error message for every admin action", () => {
    for (const action of actions) {
      const success = getAdminNotice(action, "success");
      const error = getAdminNotice(action, "error");
      expect(success).toBeTruthy();
      expect(error).toBeTruthy();
      expect(success).not.toBe(error);
    }
  });
});
