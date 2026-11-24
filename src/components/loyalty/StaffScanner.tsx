"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import AccessibleDialog from "@/components/AccessibleDialog";
import type { StaffLoyaltyMember } from "@/lib/loyalty/types";

type BarcodeDetectorInstance = {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => BarcodeDetectorInstance;

function normaliseScan(value: string) {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/loyalty\/([A-Za-z0-9_-]{24,64})\/?$/);
    if (match) return `TSC:${match[1]}`;
  } catch {}
  return trimmed;
}

export default function StaffScanner({
  onMember,
}: {
  onMember: (member: StaffLoyaltyMember) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const lookup = useCallback(async (rawCode: string) => {
    const code = normaliseScan(rawCode);
    if (!code) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/loyalty/staff/members/lookup?code=${encodeURIComponent(code)}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as { member?: StaffLoyaltyMember; error?: string };
      if (!response.ok || !result.member) {
        setError(result.error ?? "That card could not be found.");
        return;
      }
      onMember(result.member);
      setOpen(false);
    } catch {
      setError("The scanner could not reach the loyalty service.");
    } finally {
      setPending(false);
    }
  }, [onMember]);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let detecting = false;
    let cancelled = false;

    async function start() {
      const Detector = (
        window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }
      ).BarcodeDetector;
      if (!Detector || !navigator.mediaDevices?.getUserMedia) {
        setError("Camera scanning is not supported in this browser. Enter the card code below.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          if (detecting || !videoRef.current || videoRef.current.readyState < 2) return;
          detecting = true;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) await lookup(codes[0].rawValue);
          } catch {
            setError("The camera could not read that code. Try the card code instead.");
          } finally {
            detecting = false;
          }
        }, 500);
      } catch {
        setError("Camera access was not available. Enter the card code below.");
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [lookup, open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void lookup(String(form.get("code") ?? ""));
  }

  return (
    <>
      <button type="button" onClick={() => { setError(""); setOpen(true); }} className="rounded-full bg-cherry-700 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-paper-50">
        Scan customer QR
      </button>
      <AccessibleDialog
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="scanner-title"
        describedBy="scanner-description"
        className="w-[calc(100%-2rem)] max-w-lg"
      >
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.5rem] bg-paper-50 p-5 text-ink-950 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cherry-700">Staff scanner</p><h2 id="scanner-title" className="mt-2 font-display text-4xl">Find a card</h2><p id="scanner-description" className="sr-only">Scan a customer QR code or enter their card code manually.</p></div>
              <button type="button" data-dialog-initial-focus onClick={() => setOpen(false)} aria-label="Close scanner" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-950/20 text-lg">×</button>
            </div>
            <div className="mt-5 aspect-square max-h-[48vh] overflow-hidden rounded-2xl bg-ink-950">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            </div>
            <form onSubmit={submit} className="mt-5 grid gap-2 min-[380px]:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="scan-code">Card code</label>
              <input id="scan-code" name="code" autoComplete="off" placeholder="Enter the 8-character code" className="min-w-0 flex-1 rounded-xl border border-ink-950/18 bg-transparent px-4 py-3 text-sm uppercase outline-none focus:border-cherry-700" />
              <button disabled={pending} className="min-h-11 rounded-xl bg-ink-950 px-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-paper-50 disabled:opacity-50">{pending ? "Finding" : "Find"}</button>
            </form>
            {error && <p className="mt-4 text-sm leading-6 text-rust-600" role="alert">{error}</p>}
          </div>
      </AccessibleDialog>
    </>
  );
}
