import Reveal from "@/components/Reveal";
import type { CommunityEvent } from "@/data/events";

type EventCardProps = {
  event: CommunityEvent;
  notchColor: string;
  delayMs?: number;
};

export default function EventCard({ event, notchColor, delayMs = 0 }: EventCardProps) {
  return (
    <Reveal delayMs={delayMs}>
      <article className="relative overflow-hidden rounded-[1.25rem] border border-ink-950/15 bg-paper-50 text-ink-950">
        <span
          aria-hidden="true"
          className="absolute -left-3 top-[62%] h-6 w-6 rounded-full"
          style={{ backgroundColor: notchColor }}
        />
        <span
          aria-hidden="true"
          className="absolute -right-3 top-[62%] h-6 w-6 rounded-full"
          style={{ backgroundColor: notchColor }}
        />

        <div className="p-7 sm:p-9">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-900/45">At 22nd Coffee</p>
          <h3 className="mt-4 font-display text-4xl leading-tight text-ink-950 sm:text-5xl">
            {event.title}
          </h3>
          <p className="mt-4 text-sm leading-6 text-ink-900/65">{event.description}</p>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-dashed border-ink-950/25 px-7 py-5 sm:px-9">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-950">
            {event.date}
          </p>
          <p className="text-xs text-ink-900/55">{event.time}</p>
        </div>
      </article>
    </Reveal>
  );
}
