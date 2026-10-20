# twenty second coffee

The website for **twenty second coffee**, a community coffee shop in Royal Wharf, London. It includes the menu, events, the shop's story, and a way for customers to get in touch, leave feedback, or reach the team about opportunities.

**Live repo:** [github.com/amirabenbouali/twentysecondcoffee](https://github.com/amirabenbouali/twentysecondcoffee)

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- No external UI, animation, or CMS libraries. The motion system and visual identity are hand-built to keep the project lean

## Features

- **Home, Menu, Loyalty, Events, About, Contact** pages
- A website-managed loyalty scheme with customer QR cards, nine-bean rewards, and a protected staff desk
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

## Loyalty cards

The loyalty feature is independent of Square. Customers join at `/loyalty`, keep a private QR card on their phone, and staff manage beans and rewards from `/staff/loyalty` after confirming payment at the till.

The rules currently award a free standard coffee after nine qualifying purchases. Alternative milks, syrups, and other extras remain chargeable.

### Database setup

1. Create a Supabase project.
2. Open its SQL editor and run `supabase/migrations/20261019000000_create_loyalty.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add the project URL and service role key from the Supabase project settings.
5. Set a strong shared staff password and a separate random session secret.
6. Add the same four variables to the production hosting environment and redeploy.

The service role key is server-only and must never use a `NEXT_PUBLIC_` prefix. Row level security is enabled, and only server-side routes can read or change loyalty records.

Useful local command for generating a session secret:

```bash
openssl rand -base64 32
```

### Google Wallet

Google Wallet is optional. The button remains hidden until all four Google Wallet variables in `.env.example` are configured.

1. Create a Google Wallet API Issuer account in the Google Pay and Wallet Console.
2. Create a Loyalty Class in the Business Console using the shop name, logo, programme name, and the background colour `#a51f1b`.
3. Note the numeric issuer ID and the class suffix.
4. Create a Google Cloud service account, enable the Google Wallet API, and authorise that service account in the Wallet Console.
5. Add the issuer ID, class suffix, service account email, and private key to the local and production environment variables.
6. Add a test customer in demo mode, save a test pass, and then request Google publishing access.

Each pass contains the customer name, card code, bean balance, reward balance, and QR code. Staff actions update saved Google Wallet passes automatically. A failure at Google never blocks an in-shop loyalty action.

### Add to Home Screen

Every customer card serves its own web app manifest. On iPhone, the **Save to home screen** button shows the Safari steps and the installed icon reopens that customer’s private card directly. Compatible browsers with a native install prompt use that prompt automatically. This option does not require an Apple Developer account.

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
