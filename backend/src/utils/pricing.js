const PEAK_HOURS_1 = { start: 10, end: 13 };  // 10 to 1
const PEAK_HOURS_2 = { start: 16, end: 19 };  // 4 to 7

export function isPeakHour(dateObj) {
  const hour = dateObj.getHours();
  const day = dateObj.getDay(); 

  if (day === 0 || day === 6) return false;

  const inFirst = hour >= PEAK_HOURS_1.start && hour < PEAK_HOURS_1.end;
  const inSecond = hour >= PEAK_HOURS_2.start && hour < PEAK_HOURS_2.end;
  return inFirst || inSecond;
}
