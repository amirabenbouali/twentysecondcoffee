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
      <path
        d="M16 1C24.5 1 30.5 5.2 30.5 10C30.5 14.8 24.5 19 16 19C7.5 19 1.5 14.8 1.5 10C1.5 5.2 7.5 1 16 1Z"
        fill={color}
      />
      <path
        d="M16 2.5C12.5 6.3 12.5 13.7 16 17.5"
        stroke={creaseColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
