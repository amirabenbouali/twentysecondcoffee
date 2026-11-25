import { getUpcomingEvents } from "@/data/events";
import EventDiary from "@/components/events/EventDiary";

export const revalidate = 3600;

export default function EventsPreviewPage() {
  return <EventDiary entries={getUpcomingEvents()} preview="current" />;
}
