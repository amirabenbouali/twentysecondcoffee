"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "forming" | "opening" | "hidden";

type Bean = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  angle: number;
  turn: number;
  delay: number;
  curve: number;
  colour: string;
};

const SESSION_KEY = "twenty-second-coffee-intro";

function seededValue(index: number, salt: number) {
  const value = Math.sin(index * 9283.31 + salt * 77.17) * 43758.5453;
  return value - Math.floor(value);
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function makeBeans(
  width: number,
  height: number,
  displayFont: string,
  sansFont: string,
) {
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;

  const context = mask.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  const mobile = width < 640;
  const firstSize = Math.min(mobile ? width * 0.105 : width * 0.064, mobile ? 42 : 84);
  const secondSize = Math.min(mobile ? width * 0.22 : width * 0.115, mobile ? 84 : 154);
  const centreY = height * (mobile ? 0.46 : 0.48);

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `600 ${firstSize}px ${sansFont}, Arial, sans-serif`;
  context.fillText("TWENTY SECOND", width / 2, centreY - secondSize * 0.42);
  context.font = `italic ${secondSize}px ${displayFont}, Georgia, serif`;
  context.fillText("Coffee", width / 2, centreY + secondSize * 0.48);

  const pixels = context.getImageData(0, 0, width, height).data;
  const spacing = mobile ? 5 : 7;
  const beans: Bean[] = [];
  const colours = ["#d8b184", "#c49364", "#b77949", "#e1c29f"];

  for (let y = spacing; y < height - spacing; y += spacing) {
    for (let x = spacing; x < width - spacing; x += spacing) {
      if (pixels[(y * width + x) * 4 + 3] < 150) continue;

      const index = beans.length;
      const edge = Math.floor(seededValue(index, 1) * 4);
      const spreadX = seededValue(index, 2) * width;
      const spreadY = seededValue(index, 3) * height;
      let startX = spreadX;
      let startY = spreadY;

      if (edge === 0) startY = -40;
      if (edge === 1) startX = width + 40;
      if (edge === 2) startY = height + 40;
      if (edge === 3) startX = -40;

      beans.push({
        startX,
        startY,
        targetX: x + (seededValue(index, 4) - 0.5) * 2.5,
        targetY: y + (seededValue(index, 5) - 0.5) * 2.5,
        size: spacing * (0.34 + seededValue(index, 6) * 0.16),
        angle: seededValue(index, 7) * Math.PI,
        turn: (seededValue(index, 8) - 0.5) * Math.PI * 5,
        delay: seededValue(index, 9) * 0.34,
        curve: (seededValue(index, 10) - 0.5) * (mobile ? 48 : 86),
        colour: colours[Math.floor(seededValue(index, 11) * colours.length)],
      });
    }
  }

  return beans;
}

function drawBean(
  context: CanvasRenderingContext2D,
  bean: Bean,
  progress: number,
) {
  const eased = easeOutCubic(progress);
  const arc = Math.sin(eased * Math.PI) * bean.curve;
  const x = bean.startX + (bean.targetX - bean.startX) * eased + arc;
  const y = bean.startY + (bean.targetY - bean.startY) * eased - arc * 0.22;
  const rotation = bean.angle + bean.turn * (1 - eased);
  const scale = 0.55 + eased * 0.45;

  context.save();
  context.globalAlpha = Math.min(1, progress * 2.6);
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(scale, scale);
  context.fillStyle = bean.colour;
  context.strokeStyle = "rgba(74, 40, 22, 0.72)";
  context.lineWidth = 0.7;
  context.beginPath();
  context.ellipse(0, 0, bean.size * 1.45, bean.size, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.beginPath();
  context.moveTo(-bean.size * 0.82, bean.size * 0.12);
  context.bezierCurveTo(
    -bean.size * 0.3,
    -bean.size * 0.48,
    bean.size * 0.25,
    bean.size * 0.48,
    bean.size * 0.85,
    -bean.size * 0.12,
  );
  context.stroke();
  context.restore();
}

export default function CoffeeBeanIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timersRef = useRef<number[]>([]);
  const finishedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("forming");

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    try {
      window.sessionStorage.setItem(SESSION_KEY, "seen");
    } catch {
      // The intro can still finish when browser storage is unavailable.
    }
    setPhase("opening");
    timersRef.current.push(window.setTimeout(() => setPhase("hidden"), 900));
  }, []);

  useEffect(() => {
    const forceReplay = new URLSearchParams(window.location.search).has("intro");
    let hasPlayed = false;

    try {
      hasPlayed = window.sessionStorage.getItem(SESSION_KEY) === "seen";
    } catch {
      hasPlayed = false;
    }

    if (hasPlayed && !forceReplay) {
      const hideTimer = window.setTimeout(() => setPhase("hidden"), 0);
      return () => window.clearTimeout(hideTimer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let cancelled = false;

    const render = async () => {
      await document.fonts.ready;
      if (cancelled) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const displayFont = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--font-instrument-serif")
        .trim() || "Georgia";
      const sansFont = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--font-dm-sans")
        .trim() || "Arial";
      const beans = makeBeans(width, height, displayFont, sansFont);
      const startedAt = performance.now();

      const draw = (now: number) => {
        const elapsed = now - startedAt;
        context.clearRect(0, 0, width, height);

        for (const bean of beans) {
          const duration = reducedMotion ? 1 : 1550;
          const delay = reducedMotion ? 0 : bean.delay * 760;
          const progress = Math.max(0, Math.min(1, (elapsed - delay) / duration));
          if (progress > 0) drawBean(context, bean, progress);
        }

        if (!reducedMotion && elapsed < 2250) {
          frame = window.requestAnimationFrame(draw);
        }
      };

      frame = window.requestAnimationFrame(draw);
      timersRef.current.push(window.setTimeout(finish, reducedMotion ? 650 : 2750));
    };

    void render();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [finish]);

  useEffect(() => {
    if (phase === "hidden") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "hidden") return null;

  const opening = phase === "opening";

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${opening ? "pointer-events-none" : ""}`} aria-hidden="true">
      <div
        className="absolute inset-x-0 top-0 h-[50.5%] bg-[#181410] transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: opening ? "translateY(-101%)" : "translateY(0)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[50.5%] bg-[#181410] transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: opening ? "translateY(101%)" : "translateY(0)" }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(140,74,30,0.14),transparent_48%)]" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 transition-all duration-500 ease-out"
        style={{ opacity: opening ? 0 : 1, transform: opening ? "scale(1.035)" : "scale(1)" }}
      />

      <p className={`absolute inset-x-0 top-7 z-30 text-center text-[9px] font-semibold uppercase tracking-[0.32em] text-paper-100 transition-opacity duration-300 sm:top-9 ${opening ? "opacity-0" : "opacity-100"}`}>
        Royal Wharf, London
      </p>
      <span className="sr-only">twenty second coffee</span>
    </div>
  );
}
