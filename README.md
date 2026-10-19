# 22nd Coffee

The website for **22nd Coffee**, a community coffee shop in Royal Wharf, London. It includes the menu, events, the shop's story, and a way for customers to get in touch, leave feedback, or reach the team about opportunities.

**Live repo:** [github.com/amirabenbouali/twentysecondcoffee](https://github.com/amirabenbouali/twentysecondcoffee)

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- No external UI, animation, or CMS libraries. The motion system and visual identity are hand-built to keep the project lean

## Features

- **Home, Menu, Events, About, Contact** pages
- A contact form (feedback / event ideas / business opportunities) posting to an API route
- A visual identity sourced directly from the shop's logo, with extracted brand colors, a hand-drawn coffee-ring motif, and a script accent font
- An entrance/scroll animation system (staggered reveals, a coffee-ring "draw-in" effect, a scroll-aware header) that fully respects `prefers-reduced-motion`
- Editorial, non-templated layouts: a scrolling brand ticker, an asymmetric bento grid, ticket-stub event cards, torn-paper section dividers

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Editing content

Most day-to-day content lives in plain data files, not scattered across components:

| What                          | File                     |
| ------------------------------ | ------------------------ |
| Shop name, address, hours, contact info | `src/data/site.ts` |
| Menu items and prices          | `src/data/menu.ts`       |
| Upcoming events                | `src/data/events.ts`     |

Editing one of these files and redeploying is enough to update the menu, hours, or events. No component changes are required.

## Contact form

The form at `/contact` posts to `src/app/api/contact/route.ts`, which currently **logs submissions server-side only**. To actually receive messages, wire that route up to an email service (e.g. [Resend](https://resend.com), Postmark) or a form backend (e.g. Formspree).

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── menu/page.tsx
│   ├── events/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── api/contact/route.ts  # contact form submission handler
│   ├── layout.tsx            # fonts, metadata, header/footer shell
│   └── globals.css           # theme tokens + motion system
├── components/                # Header, Footer, ContactForm, EventCard,
│                               # CoffeeRing, Marquee, TornEdge, Reveal
└── data/                      # site.ts, menu.ts, events.ts
```

## Deployment

Any Next.js host works. [Vercel](https://vercel.com/new) is the path of least resistance for this project. Connect the GitHub repo and it deploys on every push to `main`.
