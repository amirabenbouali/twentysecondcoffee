import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="mt-auto grain bg-espresso-950 text-paper-100">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Image
            src="/logo-light-small.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <p className="mt-3 font-display text-lg font-semibold text-paper-50">
            {site.name}
          </p>
          <p className="mt-1 text-sm text-paper-100/60">{site.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-amber-300">Visit</p>
          <p className="mt-3 text-sm text-paper-100/80">{site.address}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-amber-300">Hours</p>
          <ul className="mt-3 space-y-1 text-sm text-paper-100/80">
            {site.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-amber-300">Get in touch</p>
          <ul className="mt-3 space-y-1 text-sm text-paper-100/80">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-paper-100/10">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-4 px-6 py-6 text-xs text-paper-100/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <nav className="flex gap-5">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
