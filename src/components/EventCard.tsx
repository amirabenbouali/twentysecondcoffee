import Reveal from "@/components/Reveal";
import type { CommunityEvent } from "@/data/events";

type EventCardProps = {
  event: CommunityEvent;
  notchColor: string;
  delayMs?: number;
};

/**
 * A ticket-stub styled event card: punched notches where a perforation
 * would run, and a dashed divider separating the details from the date
 * stamp — standing in for the generic bordered card pattern.
 */
export default function EventCard({ event, notchColor, delayMs = 0 }: EventCardProps) {
  return (
    <Reveal delayMs={delayMs}>
      <div className="relative flex rounded-xl border border-ink-950/10 bg-paper-100">
        <span
          aria-hidden="true"
          className="absolute -top-3 left-[70%] h-6 w-6 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: notchColor }}
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-3 left-[70%] h-6 w-6 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: notchColor }}
        />

        <div className="flex-1 p-6">
          <h3 className="font-display text-lg font-semibold text-ink-950">
            {event.title}
          </h3>
          <p className="mt-2 text-sm text-ink-900/70">{event.description}</p>
        </div>

        <div className="flex w-[34%] shrink-0 flex-col items-center justify-center border-l border-dashed border-ink-950/25 px-3 py-6 text-center">
          <p className="text-xs font-semibold uppercase leading-snug tracking-wide text-amber-700">
            {event.date}
          </p>
          <p className="mt-1 text-xs text-ink-900/60">{event.time}</p>
        </div>
      </div>
    </Reveal>
  );
}
