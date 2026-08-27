import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Language = "ar" | "en";

type ArticleRatingProps = {
  articleKey: string;
  language: Language;
};

const copy = {
  ar: {
    title: "قيّم هذا المقال",
    hint: "اختر تقييمك من نجمة إلى خمس نجوم",
    selected: (value: number) => `تم اختيار ${value} من 5 نجوم`,
    star: (value: number) => `${value} نجمة`,
  },
  en: {
    title: "Rate this article",
    hint: "Choose a rating from one to five stars",
    selected: (value: number) => `You selected ${value} of 5 stars`,
    star: (value: number) => `${value} star${value === 1 ? "" : "s"}`,
  },
};

function getStorageKey(articleKey: string) {
  return `khairy-article-rating:${articleKey}`;
}

function isValidRating(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function ArticleRating({ articleKey, language }: ArticleRatingProps) {
  const [rating, setRating] = useState(0);
  const labels = copy[language];

  useEffect(() => {
    try {
      const savedRating = Number(window.localStorage.getItem(getStorageKey(articleKey)));
      setRating(isValidRating(savedRating) ? savedRating : 0);
    } catch {
      setRating(0);
    }
  }, [articleKey]);

  const selectRating = (value: number) => {
    setRating(value);
    try {
      window.localStorage.setItem(getStorageKey(articleKey), String(value));
    } catch {
      // The visual control remains available if browser storage is unavailable.
    }
  };

  return <section className="article-rating" dir={language} aria-labelledby="article-rating-title">
    <h2 id="article-rating-title">{labels.title}</h2>
    <p>{rating ? labels.selected(rating) : labels.hint}</p>
    <div className="article-rating-stars" aria-label={labels.title}>
      {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={value <= rating ? "is-selected" : ""} onClick={() => selectRating(value)} aria-label={labels.star(value)} aria-pressed={rating === value}>
        <Star aria-hidden="true" size={25} strokeWidth={1.75} fill={value <= rating ? "currentColor" : "none"} />
      </button>)}
    </div>
  </section>;
}
