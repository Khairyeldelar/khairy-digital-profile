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
    const onUploadImage = vi.fn().mockResolvedValue("/manus-storage/admin/article/example.png");
    const { container } = render(<RichTextEditor value="" onChange={onChange} onUploadImage={onUploadImage} placeholder="Write" />);

    fireEvent.click(screen.getByRole("button", { name: "Upload and insert image" }));
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(["image"], "example.png", { type: "image/png" })] } });

    await waitFor(() => expect(onUploadImage).toHaveBeenCalled());
    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith("insertImage", false, "/manus-storage/admin/article/example.png"));
  });
});
