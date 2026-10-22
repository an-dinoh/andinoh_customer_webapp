import Image from "next/image";

/** The Andinoh wordmark: the colour one in light mode, the white one in dark mode (see globals.css). */
export default function Logo({ className = "h-[19px] w-auto", width = 110, height = 19, priority = false }: {
  className?: string; width?: number; height?: number; priority?: boolean;
}) {
  return (
    <>
      <Image src="/logos/ANDINOH.svg" alt="Andinoh" width={width} height={height} priority={priority} className={`logo-light ${className}`} style={{ width: "auto" }} />
      <Image src="/logos/ANDINOH WHITE.svg" alt="" aria-hidden width={width} height={height} priority={priority} className={`logo-dark ${className}`} style={{ width: "auto" }} />
    </>
  );
}
