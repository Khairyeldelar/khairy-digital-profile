import React, { useEffect, useMemo, useState } from "react";
import { defaultArticleCover } from "@/lib/defaultArticleCover";

type ProjectImageProps = {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
};

export function ProjectImage({ src, fallbackSrc, alt, className }: ProjectImageProps) {
  const sources = useMemo(() => [src, fallbackSrc, defaultArticleCover].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index), [src, fallbackSrc]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setAttempt(0), [src, fallbackSrc]);

  const currentSrc = sources[attempt];
  if (!currentSrc) return null;

  return <img className={className} src={currentSrc} alt={alt} onError={() => setAttempt((value) => Math.min(value + 1, sources.length))} />;
}
