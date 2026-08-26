import React from "react";

type AdminNoticeBannerProps = {
  message: string;
  kind: "success" | "error";
};

export function AdminNoticeBanner({ message, kind }: AdminNoticeBannerProps) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-live="polite"
      className={kind === "success" ? "rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700" : "rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700"}
    >
      {message}
    </div>
  );
}
