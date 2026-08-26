import React, { useEffect, useMemo, useState } from "react";

type ProjectImageProps = {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
};

export function ProjectImage({ src, fallbackSrc, alt, className }: ProjectImageProps) {
  const sources = useMemo(() => [src, fallbackSrc].filter((value): value is string => Boolean(value)), [src, fallbackSrc]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setAttempt(0), [src, fallbackSrc]);

  const currentSrc = sources[attempt];
  if (!currentSrc) return null;

  return <img className={className} src={currentSrc} alt={alt} onError={() => setAttempt((value) => Math.min(value + 1, sources.length))} />;
}
