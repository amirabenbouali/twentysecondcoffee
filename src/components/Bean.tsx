type BeanProps = {
  className?: string;
  color?: string;
  creaseColor?: string;
};

/** A single coffee-bean silhouette with its characteristic center crease. */
export default function Bean({
  className,
  color = "currentColor",
  creaseColor = "var(--color-paper-100)",
}: BeanProps) {
  return (
    <svg viewBox="0 0 32 20" className={className} aria-hidden="true">
      <ellipse cx="16" cy="10" rx="14.5" ry="8.5" fill={color} />
      <path
        d="M16 2.5C12.5 6.3 12.5 13.7 16 17.5"
        stroke={creaseColor}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
