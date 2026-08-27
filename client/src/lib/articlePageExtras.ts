export type RelatedArticleCandidate = {
  id?: number;
  title: string;
  category: string;
};

export function selectRelatedArticles<T extends RelatedArticleCandidate>(articles: T[], current: T, limit = 3) {
  const otherArticles = articles.filter((article) => article.id !== undefined && current.id !== undefined ? article.id !== current.id : article.title !== current.title);
  const sameCategory = otherArticles.filter((article) => article.category === current.category);

  return (sameCategory.length ? sameCategory : otherArticles).slice(0, limit);
}

export function buildSocialShareLinks(articleUrl: string, title: string) {
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedText = encodeURIComponent(title);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
  };
}
