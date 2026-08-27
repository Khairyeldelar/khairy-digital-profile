import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Video } from "lucide-react";
import React from "react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dir?: "rtl" | "ltr";
  onUploadImage: (file: File, reportProgress: (percentage: number) => void) => Promise<string>;
};

export function RichTextEditor({ value, onChange, placeholder, dir = "rtl", onUploadImage }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<Range | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) rangeRef.current = selection.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    if (!rangeRef.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(rangeRef.current);
  };
  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    saveSelection();
    onChange(editorRef.current?.innerHTML ?? "");
  };
  const insertUrl = (kind: "link" | "video") => {
    const promptLabel = kind === "link" ? "Paste a link" : "Paste a YouTube URL";
    const source = window.prompt(promptLabel);
    if (!source) return;
    if (kind === "link") run("createLink", source);
    else run("insertHTML", `<iframe src="${source}" title="Embedded video" allowfullscreen></iframe>`);
  };
  const handleImageFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setUploadProgress(2);
    setUploadStatus("uploading");
    try {
      const imageUrl = await onUploadImage(file, (percentage) => setUploadProgress(Math.max(2, Math.min(100, Math.round(percentage)))));
      editorRef.current?.focus();
      restoreSelection();
      document.execCommand("insertImage", false, imageUrl);
      saveSelection();
      onChange(editorRef.current?.innerHTML ?? "");
      setUploadProgress(100);
      setUploadStatus("success");
    } catch {
      // The owner-facing upload mutation is responsible for the visible error message.
      setUploadStatus("error");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return <div className="rich-editor" dir={dir}>
    <div className="rich-editor-toolbar" role="toolbar" aria-label="Article formatting controls">
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => run("formatBlock", "h2")} aria-label="Heading"><Heading2 size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => run("bold")} aria-label="Bold"><Bold size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => run("italic")} aria-label="Italic"><Italic size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => run("insertUnorderedList")} aria-label="Bullet list"><List size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => run("insertOrderedList")} aria-label="Numbered list"><ListOrdered size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => run("formatBlock", "blockquote")} aria-label="Quote"><Quote size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertUrl("link")} aria-label="Insert link"><Link2 size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { saveSelection(); imageInputRef.current?.click(); }} aria-label="Upload and insert image" disabled={isUploadingImage}>{isUploadingImage ? "…" : <ImagePlus size={16} />}</button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertUrl("video")} aria-label="Embed YouTube video"><Video size={16} /></button>
    </div>
    <input ref={imageInputRef} className="sr-only" type="file" accept="image/*" onChange={handleImageFile} />
    <div ref={editorRef} className="rich-editor-canvas" contentEditable suppressContentEditableWarning data-placeholder={placeholder} onFocus={saveSelection} onKeyUp={saveSelection} onMouseUp={saveSelection} onInput={() => { saveSelection(); onChange(editorRef.current?.innerHTML ?? ""); }} />
    {uploadStatus !== "idle" ? <div className={`rich-editor-upload-status rich-editor-upload-status-${uploadStatus}`} role="status" aria-live="polite"><div className="rich-editor-upload-line"><span>{uploadStatus === "uploading" ? "جارٍ رفع الصورة" : uploadStatus === "success" ? "تم إدراج الصورة" : "تعذر رفع الصورة"}</span><strong>{uploadStatus === "error" ? "!" : `${uploadProgress}%`}</strong></div><div className="rich-editor-upload-track" role="progressbar" aria-label="Image upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress}><span style={{ width: `${uploadStatus === "error" ? Math.max(uploadProgress, 8) : uploadProgress}%` }} /></div></div> : null}
  </div>;
}
