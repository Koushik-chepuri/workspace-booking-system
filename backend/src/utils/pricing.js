export const PEAK_HOURS = [
  { start: 10, end: 13 }, // 10 AM – 1 PM
  { start: 16, end: 19 }, // 4 PM – 7 PM
];

export function isPeakHour(dateObj) {
  const hour = dateObj.getHours();
  const day = dateObj.getDay(); // 0 = Sun, 6 = Sat

  if (day === 0 || day === 6) return false;

  return PEAK_HOURS.some(range => hour >= range.start && hour < range.end);
}
