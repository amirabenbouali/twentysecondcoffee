"use client";

import { useEffect, useRef } from "react";
import { createBeanScene } from "./coffeeBeanScene";
import styles from "./CoffeeBeanIntro.module.css";

const SESSION_KEY = "twenty-second-coffee-intro";
const ASSEMBLY_START = 130;
const ASSEMBLED_AT = 1260;
const BEANS_OUT_AT = 1670;
const WORDMARK_AT = 1890;
const REVEAL_AT = 2320;
const END_AT = 2710;

function phaseAt(elapsed: number) {
  if (elapsed >= REVEAL_AT) return "reveal";
  if (elapsed >= WORDMARK_AT) return "wordmark";
  if (elapsed >= BEANS_OUT_AT) return "beans-out";
  return "beans";
}
const playedInDocument = new Set<string>();

function alreadyPlayed(sessionKey: string) {
  if (playedInDocument.has(sessionKey)) return true;
  // A fresh load with ?intro is useful for reviewing the opening.
  if (new URLSearchParams(window.location.search).has("intro")) return false;
  try {
    return sessionStorage.getItem(sessionKey) === "seen";
  } catch {
    return false;
  }
}

function rememberIntro(sessionKey: string) {
  playedInDocument.add(sessionKey);
  try {
    sessionStorage.setItem(sessionKey, "seen");
  } catch {
    // The in-memory flag still prevents repeat playback on navigation.
  }
}

export default function CoffeeBeanIntro({ preview = false }: { preview?: boolean }) {
  const sessionKey = preview ? `${SESSION_KEY}-preview` : SESSION_KEY;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const canvas = canvasRef.current;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!dialog || !canvas || motion.matches || alreadyPlayed(sessionKey)) return;

    let frame = 0;
    let timeout = 0;
    let stopped = false;

    function stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      if (dialog?.open) dialog.close();
    }

    function finishForUser() {
      stop();
      // Continue at the homepage heading when the intro was the entry point.
      if (document.activeElement === document.body) {
        document.getElementById("home-heading")?.focus({ preventScroll: true });
      }
    }

    const skip = dialog.querySelector("button");
    function cancel(event: Event) {
      event.preventDefault();
      finishForUser();
    }

    function stopForMotion(event: MediaQueryListEvent) {
      if (event.matches) stop();
    }

    // Give the server-rendered hero a chance to paint first.
    frame = requestAnimationFrame(() => {
      if (stopped || motion.matches || document.hidden || window.scrollY > 0 ||
          document.activeElement !== document.body || document.querySelector("dialog:modal")) return;

      const scene = createBeanScene(canvas, window.innerWidth < 600);
      if (!scene) return;

      dialog.dataset.phase = "beans";
      scene.draw(0);
      dialog.showModal();
      rememberIntro(sessionKey);

      const start = performance.now();
      let lastProgress = 0;
      timeout = window.setTimeout(stop, END_AT + 100);
      function animate(now: number) {
        if (stopped || !dialog?.open) return;
        const elapsed = now - start;
        if (elapsed >= END_AT) {
          stop();
          return;
        }
        const phase = phaseAt(elapsed);
        if (dialog.dataset.phase !== phase) dialog.dataset.phase = phase;
        const progress = Math.min(1, (elapsed - ASSEMBLY_START) / (ASSEMBLED_AT - ASSEMBLY_START));
        if (progress > lastProgress) {
          scene?.draw(progress);
          lastProgress = progress;
        }
        frame = requestAnimationFrame(animate);
      }
      frame = requestAnimationFrame(animate);
    });

    skip?.addEventListener("click", finishForUser);
    dialog.addEventListener("cancel", cancel);
    motion.addEventListener("change", stopForMotion);
    return () => {
      stop();
      skip?.removeEventListener("click", finishForUser);
      dialog.removeEventListener("cancel", cancel);
      motion.removeEventListener("change", stopForMotion);
    };
  }, [sessionKey]);

  return (
    <dialog ref={dialogRef} className={styles.intro} aria-label="Coffee bean introduction">
      <div className={styles.composition} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.beans} />
        <p className={styles.wordmark}>twenty second coffee</p>
      </div>
      <button type="button" className={styles.skip} autoFocus>Skip intro</button>
    </dialog>
  );
}
