"use client";

import { useState } from "react";
import { Img, Modal } from "@/components/ui";
import { Gallery as GalleryIcon } from "@/components/icons";

export interface Photo { url: string; caption?: string }

/** A big photo with up to four beside it; "Show all photos" opens them all. */
export default function Gallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) {
    return <Img src={null} alt={name} className="aspect-[16/7] w-full rounded-2xl" />;
  }
  const [first, ...rest] = photos;
  // Four or more beside the big one fill a 2×2 grid; fewer stack in one column.
  const wide = rest.length >= 4;
  const side = rest.slice(0, wide ? 4 : 2);
  return (
    <>
      <div className={`relative grid gap-2 overflow-hidden rounded-2xl sm:h-[420px] ${!side.length ? "" : wide ? "sm:grid-cols-4 sm:grid-rows-2" : side.length === 1 ? "sm:grid-cols-3" : "sm:grid-cols-3 sm:grid-rows-2"}`}>
        <button type="button" onClick={() => setOpen(0)} className={side.length ? "sm:col-span-2 sm:row-span-2" : ""}>
          <Img src={first.url} alt={first.caption || name} className="aspect-[4/3] h-full w-full object-cover transition-opacity hover:opacity-95 sm:aspect-auto" />
        </button>
        {side.map((p, i) => (
          <button key={p.url + i} type="button" onClick={() => setOpen(i + 1)} className="hidden sm:block">
            <Img src={p.url} alt={p.caption || name} className="h-full w-full object-cover transition-opacity hover:opacity-95" />
          </button>
        ))}
        {photos.length > 1 && (
          <button type="button" onClick={() => setOpen(0)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-medium text-ink shadow-md hover:bg-surface">
            <GalleryIcon className="h-4 w-4" />Show all {photos.length} photos
          </button>
        )}
      </div>
      <Modal open={open !== null} onClose={() => setOpen(null)} title={name} size="lg">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto">
          {photos.map((p, i) => <Img key={p.url + i} src={p.url} alt={p.caption || name} className="w-full rounded-xl object-cover" />)}
        </div>
      </Modal>
    </>
  );
}
