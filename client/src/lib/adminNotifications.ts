export type AdminNoticeKind = "success" | "error";
export type AdminNoticeAction = "assetUpload" | "profileSave" | "projectCreate" | "projectUpdate" | "projectDelete" | "projectImageUpload" | "socialUpdate";

const notices: Record<AdminNoticeAction, Record<AdminNoticeKind, string>> = {
  assetUpload: { success: "Asset uploaded. Save profile to apply it.", error: "Asset upload failed. Please try again." },
  profileSave: { success: "Profile saved successfully.", error: "Profile could not be saved. Please try again." },
  projectCreate: { success: "Project added successfully.", error: "Project could not be added. Please try again." },
  projectUpdate: { success: "Project updated successfully.", error: "Project could not be updated. Please try again." },
  projectDelete: { success: "Project deleted.", error: "Project could not be deleted. Please try again." },
  projectImageUpload: { success: "Project image uploaded and linked.", error: "Project image upload failed. Please try again." },
  socialUpdate: { success: "Social link updated.", error: "Social link could not be updated. Please try again." },
};

export function getAdminNotice(action: AdminNoticeAction, kind: AdminNoticeKind): string {
  return notices[action][kind];
}
