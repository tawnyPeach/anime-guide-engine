import { cached } from "@/lib/cache";
import { fetchWeeklySchedule, CalendarData } from "@/lib/calendar";

export async function GET() {
  const result = await cached<CalendarData>(
    "calendar-weekly",
    async () => {
      return fetchWeeklySchedule();
    },
    { ttl: 3600, staleTtl: 7200 }
  );

  return Response.json(result);
}
