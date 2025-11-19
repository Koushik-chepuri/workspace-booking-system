export function calculatePrice(startDate, endDate, baseRate) {
  const PEAK_HOURS = [
    { start: 10, end: 13 },
    { start: 16, end: 19 },
  ];

  function isPeak(date) {
    const h = date.getHours();
    const day = date.getDay();
    if (day === 0 || day === 6) return false; // weekends NOT peak
    return PEAK_HOURS.some(p => h >= p.start && h < p.end);
  }

  function nextBoundary(current) {
    let list = [];

    // Hour boundary
    const hourEdge = new Date(current);
    hourEdge.setMinutes(0, 0, 0);
    hourEdge.setHours(current.getHours() + 1);
    list.push(hourEdge);

    // Peak boundaries
    PEAK_HOURS.forEach(p => {
      const peakStart = new Date(current);
      peakStart.setHours(p.start, 0, 0, 0);

      const peakEnd = new Date(current);
      peakEnd.setHours(p.end, 0, 0, 0);

      if (peakStart > current) list.push(peakStart);
      if (peakEnd > current) list.push(peakEnd);
    });

    // Booking end
    list.push(endDate);

    return list.filter(d => d > current).sort((a,b) => a-b)[0];
  }

  let cursor = new Date(startDate);
  let total = 0;

  while (cursor < endDate) {
    const boundary = nextBoundary(cursor);
    const blockEnd = boundary > endDate ? endDate : boundary;

    const hrs = (blockEnd - cursor) / (1000 * 60 * 60);
    const rate = isPeak(cursor) ? baseRate * 1.5 : baseRate;

    total += hrs * rate;

    cursor = blockEnd;
  }

  return Math.round(total);
}
