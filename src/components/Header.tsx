"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/data/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `relative py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-55 ${
      active ? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-current" : ""
    }`;
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          transparent
            ? "border-b border-paper-50/25 bg-transparent text-paper-50"
            : "border-b border-ink-950/10 bg-paper-50/95 text-ink-950 shadow-[0_8px_30px_rgba(24,20,16,0.04)] backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-10">
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            {nav.slice(0, 3).map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="col-start-2 flex items-center gap-2 sm:gap-2.5" aria-label={`${site.name} home`}>
            <Image
              src={transparent ? "/logo-light-small.png" : "/logo-small.png"}
              alt=""
              width={32}
              height={32}
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              priority
            />
            <span className="whitespace-nowrap font-display text-[1.12rem] leading-none tracking-[-0.035em] sm:text-[1.4rem] lg:text-[1.55rem]">{site.name}</span>
          </Link>

          <nav className="hidden items-center justify-end gap-6 md:flex" aria-label="Secondary navigation">
            {nav.slice(3).map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
            <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-current px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-ink-950 hover:text-paper-50">
              Visit us
            </a>
          </nav>

          <button
            type="button"
            className="col-start-3 flex h-10 w-10 justify-self-end items-center justify-center rounded-full border border-current/35 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 8h16M4 16h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <nav className="fixed inset-x-0 top-[72px] z-40 border-b border-ink-950/10 bg-paper-50 px-5 py-5 text-ink-950 shadow-xl md:hidden" aria-label="Mobile navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-ink-950/10 py-3 font-display text-3xl last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
