import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "pulse" });

export function isNyseCoreHours(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekday = values.weekday;
  const hour = Number(values.hour);
  const minute = Number(values.minute);
  const weekdayOpen = weekday !== "Sat" && weekday !== "Sun";
  return weekdayOpen && (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;
}
