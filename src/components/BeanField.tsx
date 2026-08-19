"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Bean from "@/components/Bean";
import { beanField } from "@/data/beanField";

type BeanFieldProps = {
  className?: string;
  color?: string;
  creaseColor?: string;
};

/**
 * "22" traced by ~240 scattered coffee beans, inspired by thefolks.pt's
 * bean-silhouette art. Beans sprinkle into place as the field scrolls
 * into view; final state is always fully visible (see .bean in
 * globals.css) so nothing depends on the animation actually running.
 */
export default function BeanField({ className = "", color, creaseColor }: BeanFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative aspect-[1037/596] w-full ${className}`}
      aria-label="22"
      role="img"
    >
      {beanField.map((p, i) => (
        <div
          key={i}
          className="absolute"
          aria-hidden="true"
          style={{
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            width: "4.4%",
            transform: `translate(-50%, -50%) rotate(${p.r}deg) scale(${p.s})`,
          }}
        >
          <div
            className={`bean ${visible ? "is-visible" : ""}`}
            style={{ "--bean-delay": `${(i % 90) * 9}ms` } as CSSProperties}
          >
            <Bean color={color} creaseColor={creaseColor} />
          </div>
        </div>
      ))}
    </div>
  );
}
