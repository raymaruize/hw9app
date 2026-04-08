const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'clear',
  1: 'mostly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'foggy',
  51: 'light drizzle',
  53: 'drizzle',
  55: 'heavy drizzle',
  56: 'freezing drizzle',
  57: 'freezing drizzle',
  61: 'light rain',
  63: 'rainy',
  65: 'heavy rain',
  66: 'freezing rain',
  67: 'freezing rain',
  71: 'light snow',
  73: 'snowy',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'rain showers',
  81: 'rain showers',
  82: 'heavy rain showers',
  85: 'snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm and hail',
  99: 'thunderstorm and hail',
};

type OpenMeteoResponse = {
  current?: {
    weather_code?: number;
  };
};

export async function getCurrentWeatherSummary(latitude: number, longitude: number): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code&timezone=auto`;
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const code = data.current?.weather_code;
    if (typeof code !== 'number') {
      return undefined;
    }

    return WEATHER_CODE_MAP[code] ?? 'variable weather';
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}
