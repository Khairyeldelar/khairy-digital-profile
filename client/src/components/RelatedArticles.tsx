import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { selectRelatedArticles } from "@/lib/articlePageExtras";
import { workCategories } from "@/lib/workCategories";
import type { Project } from "@/pages/Home";

type Language = "ar" | "en";

type RelatedArticlesProps = {
  articles: Project[];
  currentArticle: Project;
  language: Language;
};

const copy = {
  ar: { title: "مقالات ذات صلة", action: "اقرأ المزيد" },
  en: { title: "Related articles", action: "Read more" },
};

export function RelatedArticles({ articles, currentArticle, language }: RelatedArticlesProps) {
  const relatedArticles = selectRelatedArticles(articles, currentArticle);
  const labels = copy[language];

  if (!relatedArticles.length) return null;

  return <section className="related-articles" dir={language} aria-labelledby="related-articles-title">
    <div className="related-articles-heading"><span className="article-kicker">{language === "ar" ? "اكتشف المزيد" : "Discover more"}</span><h2 id="related-articles-title">{labels.title}</h2></div>
    <div className="related-articles-grid">
      {relatedArticles.map((article) => {
        const category = workCategories.find((item) => item.id === article.category);
        const title = language === "ar" ? article.titleAr : article.title;
        const description = language === "ar" ? article.descriptionAr : article.description;
        const categoryLabel = language === "ar" ? category?.labelAr : category?.labelEn;

        return <Link key={article.id ?? article.title} href={`/article/${encodeURIComponent(article.title)}`} className="related-article-card">
          <span>{categoryLabel}</span><strong>{title}</strong><p>{description}</p><em>{labels.action}<ArrowUpRight size={15} /></em>
        </Link>;
      })}
    </div>
  </section>;
}
