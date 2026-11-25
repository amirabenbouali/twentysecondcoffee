import type { Metadata } from "next";
import EventDiary from "@/components/events/EventDiary";
import { getUpcomingEvents } from "@/data/events";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Events | ${site.name}`,
  description: `Coffee mornings, tastings, pop-ups, and neighbourhood gatherings at ${site.name} in ${site.neighborhood}.`,
};

export const revalidate = 3600;

export default function EventsPage() {
  return <EventDiary entries={getUpcomingEvents()} />;
}
