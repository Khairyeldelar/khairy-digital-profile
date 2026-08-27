// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichTextEditor } from "./RichTextEditor";

describe("RichTextEditor image upload", () => {
  beforeEach(() => {
    Object.defineProperty(document, "execCommand", { configurable: true, value: vi.fn(() => true) });
  });

  it("uploads a selected file and inserts its managed URL into the editor", async () => {
    const onChange = vi.fn();
    let finishUpload: ((url: string) => void) | undefined;
    const onUploadImage = vi.fn((_file: File, reportProgress: (percentage: number) => void) => new Promise<string>((resolve) => {
      reportProgress(62);
      finishUpload = resolve;
    }));
    const { container } = render(<RichTextEditor value="" onChange={onChange} onUploadImage={onUploadImage} placeholder="Write" />);

    fireEvent.click(screen.getByRole("button", { name: "Upload and insert image" }));
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(["image"], "example.png", { type: "image/png" })] } });

    await waitFor(() => expect(onUploadImage).toHaveBeenCalled());
    expect(screen.getByRole("status").textContent).toContain("62%");
    finishUpload?.("/manus-storage/admin/article/example.png");
    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith("insertImage", false, "/manus-storage/admin/article/example.png"));
    expect(screen.getByRole("status").textContent).toContain("تم إدراج الصورة");
  });
});
