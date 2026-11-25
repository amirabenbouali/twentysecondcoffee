import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy/constants";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Privacy | ${site.name}`,
  description: `How ${site.name} uses information from enquiries and its loyalty programme.`,
  robots: { index: false, follow: false },
};

const reviewNote =
  "This draft is awaiting client and legal review. Details shown in square brackets must be confirmed before launch.";

function ReviewItem({ children }: { children: ReactNode }) {
  return (
    <span className="font-semibold text-cherry-700">[CLIENT OR LEGAL REVIEW: {children}]</span>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#f5efe3] text-ink-950">
      <header className="border-b border-ink-950/15 px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-40 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">
            Privacy notice draft
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.1rem,9vw,8rem)] leading-[0.86] tracking-[-0.045em]">
            Your information, explained clearly.
          </h1>
          <div className="mt-10 max-w-3xl rounded-2xl border border-cherry-700/25 bg-paper-50 p-5 text-sm leading-6">
            <p className="font-semibold">Not yet approved for publication as a final legal notice.</p>
            <p className="mt-2 text-ink-900/65">{reviewNote}</p>
          </div>
          <p className="mt-6 text-xs text-ink-700">
            Draft version {PRIVACY_NOTICE_VERSION}. Last updated 24 November 2026.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[13rem_1fr] lg:px-10 lg:py-24">
        <nav className="h-fit border-y border-ink-950/15 py-5 text-xs leading-7 lg:sticky lg:top-28" aria-label="Privacy page sections">
          <a className="block hover:text-cherry-700" href="#who-we-are">Who we are</a>
          <a className="block hover:text-cherry-700" href="#information">Information we use</a>
          <a className="block hover:text-cherry-700" href="#why">Why we use it</a>
          <a className="block hover:text-cherry-700" href="#services">Services and sharing</a>
          <a className="block hover:text-cherry-700" href="#retention">Retention and security</a>
          <a className="block hover:text-cherry-700" href="#rights">Your choices and rights</a>
        </nav>

        <article className="space-y-16 text-sm leading-7 text-ink-900/72">
          <section id="who-we-are" className="scroll-mt-28">
            <h2 className="font-display text-5xl leading-none text-ink-950">Who we are</h2>
            <p className="mt-6">
              This website is operated for {site.name} at {site.address}. The organisation responsible for personal information is <ReviewItem>confirm the legal entity or sole trader name</ReviewItem>. A public privacy email or postal contact must also be confirmed. Until then, privacy requests can be submitted through our secure contact form.
            </p>
            <Link href="/contact?topic=privacy" className="mt-6 inline-flex rounded-full bg-ink-950 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50">
              Make a privacy request
            </Link>
          </section>

          <section id="information" className="scroll-mt-28">
            <h2 className="font-display text-5xl leading-none text-ink-950">Information we use</h2>
            <div className="mt-7 space-y-7">
              <div><h3 className="font-display text-2xl text-ink-950">Contact enquiries</h3><p className="mt-2">Your name, email address, chosen topic, message, and a technical submission identifier. A short-lived, one-way representation of your network address may be used to limit spam. The message content is not intentionally written to application logs.</p></div>
              <div><h3 className="font-display text-2xl text-ink-950">Loyalty membership</h3><p className="mt-2">Your first name, email address, private card code, member code, bean and reward balances, account timestamps, staff loyalty actions, the privacy notice version shown to you, and any optional marketing choice. Marketing is not required to join.</p></div>
              <div><h3 className="font-display text-2xl text-ink-950">Google Wallet</h3><p className="mt-2">If you choose to add a card to Google Wallet, your first name, member code, QR code, bean balance, and reward balance are included in the pass. This is optional.</p></div>
              <div><h3 className="font-display text-2xl text-ink-950">Information kept on your device</h3><p className="mt-2">The private address of your loyalty card may be saved in local storage so you can return to it. Session storage remembers whether the opening animation has played. Staff authentication uses a secure, HTTP-only cookie. We found no advertising analytics in the current website.</p></div>
            </div>
          </section>

          <section id="why" className="scroll-mt-28">
            <h2 className="font-display text-5xl leading-none text-ink-950">Why we use it</h2>
            <ul className="mt-7 list-disc space-y-4 pl-5">
              <li>To answer enquiries and manage requests. <ReviewItem>confirm the appropriate lawful basis for each enquiry type</ReviewItem>.</li>
              <li>To create, operate, recover, and protect loyalty cards and apply rewards. <ReviewItem>confirm whether contract or legitimate interests is the appropriate basis</ReviewItem>.</li>
              <li>To prevent spam, misuse, and unauthorised staff access. <ReviewItem>confirm the legitimate-interests assessment</ReviewItem>.</li>
              <li>To send occasional marketing only when a customer has actively opted in. The lawful basis is consent, which can be withdrawn at any time.</li>
            </ul>
            <p className="mt-5">No solely automated decisions with legal or similarly significant effects were identified in the current service.</p>
          </section>

          <section id="services" className="scroll-mt-28">
            <h2 className="font-display text-5xl leading-none text-ink-950">Services and sharing</h2>
            <p className="mt-6">Information is shared only as needed to run the website and requested features. Current or planned providers are:</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left text-xs leading-6">
                <thead><tr className="border-b border-ink-950/25 text-ink-950"><th className="py-3 pr-4">Provider</th><th className="py-3 pr-4">Purpose</th><th className="py-3">Review needed</th></tr></thead>
                <tbody className="divide-y divide-ink-950/12">
                  <tr><td className="py-4 pr-4">Website host</td><td className="py-4 pr-4">Delivering the website and API</td><td className="py-4">Confirm provider, region, logs, and contract</td></tr>
                  <tr><td className="py-4 pr-4">Supabase</td><td className="py-4 pr-4">Loyalty database</td><td className="py-4">Confirm project region, retention, and data terms</td></tr>
                  <tr><td className="py-4 pr-4">Resend</td><td className="py-4 pr-4">Delivering contact enquiries</td><td className="py-4">Confirm account settings, retention, and data terms</td></tr>
                  <tr><td className="py-4 pr-4">Upstash</td><td className="py-4 pr-4">Short-lived spam rate limiting</td><td className="py-4">Confirm region and data terms</td></tr>
                  <tr><td className="py-4 pr-4">Google Wallet</td><td className="py-4 pr-4">Optional digital loyalty pass</td><td className="py-4">Confirm issuer settings and Google terms</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5"><ReviewItem>confirm international data transfers, applicable safeguards, and processor agreements before launch</ReviewItem>.</p>
          </section>

          <section id="retention" className="scroll-mt-28">
            <h2 className="font-display text-5xl leading-none text-ink-950">Retention and security</h2>
            <p className="mt-6">Access to customer records is restricted to authorised staff and server-side service credentials. Public loyalty responses do not include email addresses or marketing choices. Staff sessions use secure cookies, and database tables use row-level security with public access revoked.</p>
            <p className="mt-4"><ReviewItem>approve specific retention periods for enquiries, active and inactive loyalty accounts, consent evidence, operational logs, backups, and wallet passes</ReviewItem>. The spam-limiting identifier expires automatically after its short rate-limit window. Information stored in your browser remains until you clear it or remove the site data.</p>
          </section>

          <section id="rights" className="scroll-mt-28">
            <h2 className="font-display text-5xl leading-none text-ink-950">Your choices and rights</h2>
            <p className="mt-6">Depending on the circumstances, you may ask for access to or correction of your information, request deletion or restriction, object to certain uses, and receive information about how it is handled. Some rights are not absolute.</p>
            <p className="mt-4">You can withdraw marketing consent at any time without losing your loyalty card. Use the privacy request form and select “Privacy or data request”. Future marketing emails must also include an unsubscribe option.</p>
            <p className="mt-4">We will verify identity before disclosing, changing, or deleting account information. <ReviewItem>confirm the request owner, approved verification method, response process, and current legal deadline</ReviewItem>.</p>
            <p className="mt-4">You may also raise a concern with the UK Information Commissioner’s Office. Visit <a className="font-semibold text-ink-950 underline underline-offset-4" href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">ico.org.uk</a> for current guidance.</p>
          </section>

          <section className="border-t border-ink-950/15 pt-8">
            <h2 className="font-display text-3xl text-ink-950">Changes to this notice</h2>
            <p className="mt-4">Material changes will be reflected by updating the date and version above. Where required, customers will be given a new choice rather than having an earlier marketing choice applied to new purposes.</p>
          </section>
        </article>
      </div>
    </div>
  );
}
