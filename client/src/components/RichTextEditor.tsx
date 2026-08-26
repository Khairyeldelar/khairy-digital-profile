import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Video } from "lucide-react";
import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dir?: "rtl" | "ltr";
};

export function RichTextEditor({ value, onChange, placeholder, dir = "rtl" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  };
  const insertUrl = (kind: "link" | "image" | "video") => {
    const promptLabel = kind === "link" ? "Paste a link" : kind === "image" ? "Paste an image URL" : "Paste a YouTube URL";
    const source = window.prompt(promptLabel);
    if (!source) return;
    if (kind === "link") run("createLink", source);
    else if (kind === "image") run("insertImage", source);
    else run("insertHTML", `<iframe src="${source}" title="Embedded video" allowfullscreen></iframe>`);
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
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertUrl("image")} aria-label="Insert image"><ImagePlus size={16} /></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertUrl("video")} aria-label="Embed YouTube video"><Video size={16} /></button>
    </div>
    <div ref={editorRef} className="rich-editor-canvas" contentEditable suppressContentEditableWarning data-placeholder={placeholder} onInput={() => onChange(editorRef.current?.innerHTML ?? "")} />
  </div>;
}
