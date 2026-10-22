"use client";

import { useState } from "react";
import { Gallery } from "@/components/icons";
import { apiAsset } from "@/utils/format";

/** An image from the API: resolves relative paths and shows a quiet placeholder if it can’t load. */
export default function Img({ src, alt = "", className = "" }: { src: string | null | undefined; alt?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const url = apiAsset(src);
  if (!url || failed) {
    return <span role="img" aria-label={alt || "No image"} className={`flex items-center justify-center bg-surface-2 text-subtle ${className}`}><Gallery className="h-1/3 max-h-8 w-1/3 max-w-8" /></span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}
