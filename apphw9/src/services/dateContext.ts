const SOLAR_FESTIVAL_MAP: Record<string, string> = {
  '01-01': 'New Year',
  '02-14': 'Valentine\'s Day',
  '10-01': 'National Day (China)',
  '12-25': 'Christmas',
};

function seasonFromMonth(monthIndex: number): string {
  if (monthIndex <= 1 || monthIndex === 11) return 'winter';
  if (monthIndex <= 4) return 'spring';
  if (monthIndex <= 7) return 'summer';
  return 'autumn';
}

function timeOfDayFromHour(hour: number): string {
  if (hour < 6) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'night';
}

export function deriveDefaultTemporalContext(now = new Date()): {
  season: string;
  time_of_day: string;
  date_context: string;
  lunar_date_or_festival: string;
} {
  const month = now.getMonth();
  const day = now.getDate().toString().padStart(2, '0');
  const monthStr = (month + 1).toString().padStart(2, '0');
  const weekday = now.getDay();

  const seasonal = seasonFromMonth(month);
  const dayTime = timeOfDayFromHour(now.getHours());
  const weekend = weekday === 0 || weekday === 6;
  const dateContext = weekend ? 'weekend' : 'weekday';
  const solarFestival = SOLAR_FESTIVAL_MAP[`${monthStr}-${day}`] ?? '';

  return {
    season: seasonal,
    time_of_day: dayTime,
    date_context: solarFestival ? `${dateContext}, ${solarFestival}` : dateContext,
    lunar_date_or_festival: solarFestival,
  };
}
