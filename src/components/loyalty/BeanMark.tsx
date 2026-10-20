export default function BeanMark({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 56"
      className="h-full w-full"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M35.9 5.5C44 12.4 43.2 27.2 34 40.2 24.9 53.1 11.1 58 4.6 50.7-1.9 43.4.8 28.6 10 15.6 19.2 2.7 29.4-.1 35.9 5.5Z" />
      <path d="M34.9 6.9c-8.7 8-7.2 16.5-13.1 24.9-4.1 5.8-9.5 9.4-16 16.4" />
      <path d="M10.8 15.8c5.5 5.4 9.1 9.6 10.9 16.1M33.9 40.1c-5.4-5.1-9.1-9-12.1-8.3" opacity=".72" />
    </svg>
  );
}
