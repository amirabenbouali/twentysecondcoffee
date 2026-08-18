"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { nav, site } from "@/data/site";

const vertical: CSSProperties = {
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
};

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: persistent vertical sidebar, not a top bar */}
      <header className="fixed inset-y-0 left-0 z-50 hidden w-20 flex-col items-center justify-between border-r border-paper-50/10 bg-espresso-950 py-7 md:flex">
        <Link href="/" aria-label={site.name}>
          <Image
            src="/logo-light-small.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
        </Link>

        <nav className="flex flex-col items-center gap-8">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={vertical}
                className={`text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-amber-400" : "text-paper-50/60 hover:text-paper-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span style={vertical} className="text-[10px] uppercase tracking-[0.25em] text-paper-50/30">
          Est. Royal Wharf
        </span>
      </header>

      {/* Mobile: slim top bar with a slide-down menu */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-ink-950/10 bg-paper-50/95 px-5 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/logo-small.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="font-display text-lg font-semibold text-ink-950">{site.name}</span>
        </Link>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-ink-950"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>

      {open && (
        <nav className="fixed inset-x-0 top-[57px] z-40 flex flex-col gap-1 border-b border-ink-950/10 bg-paper-50 px-5 py-4 md:hidden">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2 text-sm font-medium ${
                  active ? "text-amber-600" : "text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
