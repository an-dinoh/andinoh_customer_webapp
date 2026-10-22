import * as React from 'react';
import { ICONS, type IconStyle } from './iconsax.data';

/**
 * Iconsax icons from the Figma file "7000 FREE UI ICONS" (names: scripts/icon-map.json).
 * Size with className (w-4 h-4), colour with text-*. Decorative unless given an aria-label.
 */
export type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'dangerouslySetInnerHTML'> & { variant?: IconStyle };
export type Icon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

export function make(name: string): Icon {
  const icon = React.forwardRef<SVGSVGElement, IconProps>(({ variant = 'linear', width = 24, height = 24, ...props }, ref) => {
    const data = ICONS[name][variant] ?? ICONS[name].linear!;
    const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
    return (
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={data.viewBox} width={width} height={height} fill="none"
        aria-hidden={labelled ? undefined : true} role={labelled ? 'img' : undefined} focusable="false"
        {...props} dangerouslySetInnerHTML={{ __html: data.body }} />
    );
  });
  icon.displayName = name;
  return icon;
}

/** Spinner in the same 1.5px stroke style (Iconsax has none); spin it with animate-spin. */
export const Spinner: Icon = React.forwardRef<SVGSVGElement, IconProps>(({ width = 24, height = 24, ...rest }, ref) => {
  const props = { ...rest };
  delete props.variant;
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="none" aria-hidden focusable="false" {...props}>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M21.25 12A9.25 9.25 0 0 0 12 2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
});
Spinner.displayName = 'Spinner';
