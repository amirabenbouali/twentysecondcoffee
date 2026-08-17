type MarqueeProps = {
  items: string[];
  className?: string;
};

/**
 * Infinite scrolling brand strip. Decorative — content repeats elsewhere
 * on the page, so the whole thing is hidden from assistive tech.
 */
export default function Marquee({ items, className = "" }: MarqueeProps) {
  const line = items.join("   ✦   ") + "   ✦   ";

  return (
    <div aria-hidden="true" className={`overflow-hidden ${className}`}>
      <div className="marquee-track">
        <span className="shrink-0 whitespace-nowrap pr-0">{line}</span>
        <span className="shrink-0 whitespace-nowrap pr-0">{line}</span>
      </div>
    </div>
  );
}
