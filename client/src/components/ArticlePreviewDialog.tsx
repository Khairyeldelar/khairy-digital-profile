import { hasRichMarkup, sanitizeArticleHtml } from "@/lib/richArticleHtml";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

type ArticlePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary: string;
  body: string;
  category: "applications" | "tutorials" | "videos";
};

const categoryLabel = {
  applications: "تطبيق أو لعبة",
  tutorials: "شرح أو معلومة",
  videos: "فيديو",
};

export function ArticlePreviewDialog({ open, onOpenChange, title, summary, body, category }: ArticlePreviewDialogProps) {
  const safeBody = sanitizeArticleHtml(body);
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="article-preview-dialog max-h-[90vh] max-w-3xl overflow-y-auto" dir="rtl">
      <DialogHeader className="border-b pb-4 text-right">
        <p className="text-xs font-medium tracking-[0.14em] text-primary">معاينة قبل النشر · {categoryLabel[category]}</p>
        <DialogTitle className="text-2xl leading-snug">{title || "عنوان المقال سيظهر هنا"}</DialogTitle>
        <DialogDescription>هذه معاينة للمحتوى كما سيظهر في صفحة المقال للزائر.</DialogDescription>
      </DialogHeader>
      <article className="article-preview-content">
        {summary ? <p className="article-preview-summary">{summary}</p> : <p className="article-preview-empty">اكتب وصفًا مختصرًا يظهر هنا وفي البطاقة.</p>}
        {body ? hasRichMarkup(body) ? <div className="rich-article-render" dangerouslySetInnerHTML={{ __html: safeBody }} /> : <div className="article-rich-body">{body}</div> : <p className="article-preview-empty">اكتب محتوى المقال داخل المحرر لتظهر الكتابة والصور والروابط والفيديوهات هنا.</p>}
      </article>
    </DialogContent>
  </Dialog>;
}
