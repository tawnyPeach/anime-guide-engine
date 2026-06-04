import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CalendarGrid from "@/components/CalendarGrid";
import { fetchWeeklySchedule, WeeklySchedule } from "@/lib/calendar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Anime Calendar - What's Airing Today",
  description:
    "See what anime episodes are airing this week. Check today's airing schedule with countdown timers and never miss a new episode.",
  alternates: { canonical: "/calendar" },
};

export default async function CalendarPage() {
  let schedule: WeeklySchedule = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  try {
    const data = await fetchWeeklySchedule();
    schedule = data.schedule;
  } catch {
    // AniList unavailable - render empty schedule
  }

  const totalEpisodes = Object.values(schedule).reduce(
    (sum, entries) => sum + entries.length,
    0
  );

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
          in your local timezone. {totalEpisodes > 0 && `${totalEpisodes} episodes this week.`}
        </p>
      </section>

      {/* Calendar Grid */}
      <CalendarGrid schedule={schedule} />
    </div>
  );
}
