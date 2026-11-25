import type { CommunityEvent } from "@/data/events";
import EventDiary from "@/components/events/EventDiary";

const sampleEntries = [
  {
    title: "A neighbourhood reading hour",
    date: "2030-04-12",
    time: "10am to 11am",
    description: "A sample listing for a quiet hour with a book and a cup of coffee.",
  },
  {
    title: "Coffee and conversation",
    date: "Saturday 27 April 2030",
    time: "2pm to 3pm",
    description: "A sample listing for an informal afternoon catch-up.",
  },
] satisfies CommunityEvent[];

export default function SampleEventsPreviewPage() {
  return <EventDiary entries={sampleEntries} preview="sample" />;
}
