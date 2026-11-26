import { publicPageMetadata } from "@/lib/seo";
import EventDiary from "@/components/events/EventDiary";
import { getUpcomingEvents } from "@/data/events";

export const metadata = publicPageMetadata("/events");

export const revalidate = 3600;

export default function EventsPage() {
  return <EventDiary entries={getUpcomingEvents()} />;
}
