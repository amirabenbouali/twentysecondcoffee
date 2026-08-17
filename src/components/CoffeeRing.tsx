import type { CSSProperties } from "react";

type CoffeeRingProps = {
  className?: string;
  seed?: number;
  delayMs?: number;
};

/**
 * Decorative ring echoing the coffee-stain in the 22nd Coffee logo mark.
 * Draws itself on for users without prefers-reduced-motion. Pure
 * background texture — marked aria-hidden.
 */
export default function CoffeeRing({ className, seed = 7, delayMs = 0 }: CoffeeRingProps) {
  const filterId = `ring-wobble-${seed}`;

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed={seed}
            result="turb"
          />
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="22" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <circle
          className="ring-stroke"
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="var(--color-amber-300)"
          strokeWidth="46"
          opacity="0.55"
        />
        <circle
          className="ring-stroke"
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="var(--color-amber-600)"
          strokeWidth="10"
          opacity="0.45"
        />
      </g>
    </svg>
  );
}
