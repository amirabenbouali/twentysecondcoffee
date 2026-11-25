"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccessibleDialog from "@/components/AccessibleDialog";
import { nav, site } from "@/data/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeForDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeForDesktop);
    return () => desktop.removeEventListener("change", closeForDesktop);
  }, []);

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `relative py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-55 ${
      active ? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-current" : ""
    }`;
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-950/10 bg-paper-50/95 text-ink-950 shadow-[0_8px_30px_rgba(24,20,16,0.04)] backdrop-blur-xl">
        <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-10">
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6" aria-label="Primary navigation">
            {nav.slice(0, 3).map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="col-start-2 flex items-center gap-2 sm:gap-2.5" aria-label={`${site.name} home`}>
            <Image
              src="/logo-small.png"
              alt=""
              width={32}
              height={32}
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              priority
            />
            <span className="whitespace-nowrap font-display text-[1.12rem] leading-none tracking-[-0.035em] sm:text-[1.4rem] lg:text-[1.55rem]">{site.name}</span>
          </Link>

          <nav className="hidden items-center justify-end gap-4 lg:flex xl:gap-6" aria-label="Secondary navigation">
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
            className="col-start-3 flex h-11 w-11 justify-self-end items-center justify-center rounded-full border border-current/35 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 8h16M4 16h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </header>

      <AccessibleDialog
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="mobile-menu-title"
        className="mobile-menu-dialog lg:hidden"
      >
        <div className="flex min-h-dvh flex-col bg-paper-50 text-ink-950">
          <div className="flex h-[72px] items-center justify-between border-b border-ink-950/10 px-5 sm:px-8">
            <p id="mobile-menu-title" className="font-display text-2xl tracking-[-0.035em]">
              {site.name}
            </p>
            <button
              type="button"
              data-dialog-initial-focus
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-950/30"
              aria-label="Close menu"
            >
              <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav id="mobile-navigation" className="flex flex-1 flex-col px-5 py-5 sm:px-8" aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className="flex min-h-14 items-center border-b border-ink-950/10 py-3 font-display text-3xl"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-auto flex min-h-12 items-center justify-center rounded-full bg-ink-950 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-50"
            >
              Visit us
            </a>
          </nav>
        </div>
      </AccessibleDialog>
    </>
  );
}
