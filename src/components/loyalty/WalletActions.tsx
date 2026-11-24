"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import AccessibleDialog from "@/components/AccessibleDialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function standaloneSnapshot() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function subscribeToStandalone(callback: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function HomeScreenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3M8 7l4-4 4 4" />
      <path d="M6 10H4v10h16V10h-2" />
    </svg>
  );
}

export default function WalletActions({ googleWalletUrl }: { googleWalletUrl?: string | null }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installedThisVisit, setInstalledThisVisit] = useState(false);
  const standalone = useSyncExternalStore(subscribeToStandalone, standaloneSnapshot, () => false);
  const isStandalone = standalone || installedThisVisit;

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  async function install() {
    if (installPrompt) {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") setInstalledThisVisit(true);
      setInstallPrompt(null);
      return;
    }
    setShowInstructions(true);
  }

  return (
    <>
      <div className="mt-6 grid items-center gap-2 sm:grid-cols-2">
        {googleWalletUrl && (
          <a href={googleWalletUrl} aria-label="Add this loyalty card to Google Wallet" className="flex min-h-[71px] items-center justify-center p-2 transition-opacity hover:opacity-85">
            <Image src="/add-to-google-wallet-en-gb-condensed.svg" alt="Add to Google Wallet" width={199} height={55} unoptimized />
          </a>
        )}
        <button type="button" onClick={install} disabled={isStandalone} className={`flex min-h-[55px] items-center justify-center gap-2 rounded-full border border-ink-950/25 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink-950 hover:text-paper-50 disabled:cursor-default disabled:opacity-55 ${googleWalletUrl ? "" : "sm:col-span-2"}`}>
          <HomeScreenIcon /> {isStandalone ? "Saved to home screen" : "Save to home screen"}
        </button>
      </div>

      <AccessibleDialog
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        labelledBy="home-screen-title"
        describedBy="home-screen-description"
        className="w-[calc(100%-2rem)] max-w-md"
      >
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.5rem] bg-paper-50 p-6 text-ink-950 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cherry-700">Keep your card close</p>
                <h2 id="home-screen-title" className="mt-3 font-display text-4xl leading-none tracking-[-0.03em]">Save it to your iPhone.</h2>
                <p id="home-screen-description" className="sr-only">Instructions for adding your loyalty card to an iPhone home screen.</p>
              </div>
              <button type="button" data-dialog-initial-focus onClick={() => setShowInstructions(false)} aria-label="Close instructions" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-950/20 text-lg">×</button>
            </div>
            <ol className="mt-7 space-y-5 text-sm leading-6 text-ink-900/65">
              <li className="grid grid-cols-[36px_1fr] items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-cherry-700/30 text-cherry-700"><ShareIcon /></span><span>Open this card in Safari, then tap the Share symbol at the bottom of the screen.</span></li>
              <li className="grid grid-cols-[36px_1fr] items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-cherry-700/30 font-display text-2xl text-cherry-700">+</span><span>Scroll through the actions and choose <strong className="font-medium text-ink-950">Add to Home Screen</strong>.</span></li>
              <li className="grid grid-cols-[36px_1fr] items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-cherry-700/30 font-mono text-[10px] text-cherry-700">03</span><span>Tap <strong className="font-medium text-ink-950">Add</strong>. Your live loyalty card will appear beside your apps.</span></li>
            </ol>
            <button type="button" onClick={() => setShowInstructions(false)} className="mt-7 w-full rounded-full bg-ink-950 px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-paper-50">Got it</button>
          </div>
      </AccessibleDialog>
    </>
  );
}
