import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CalendarGrid from "@/components/CalendarGrid";
import { fetchWeeklySchedule, AiringEntry } from "@/lib/calendar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Anime Calendar - What's Airing Today",
  description:
    "See what anime episodes are airing this week. Check today's airing schedule with countdown timers and never miss a new episode.",
  alternates: { canonical: "/calendar" },
};

export default async function CalendarPage() {
  let entries: AiringEntry[] = [];

  try {
    const data = await fetchWeeklySchedule();
    entries = data.entries;
  } catch {
    // AniList unavailable - render empty schedule
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Calendar" }]} />

      {/* Page Header */}
      <section className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Anime Calendar
          </h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Weekly airing schedule for currently broadcasting anime. Times are shown
          in your local timezone. {entries.length > 0 && `${entries.length} episodes this week.`}
        </p>
      </section>

      {/* Calendar Grid */}
      <CalendarGrid entries={entries} />
    </div>
  );
}
