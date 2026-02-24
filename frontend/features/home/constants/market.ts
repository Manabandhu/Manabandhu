export const MARKET_ENDPOINTS = {
  weather:
    "https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current=temperature_2m,weather_code&temperature_unit=fahrenheit",
  currency: "https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP,INR,NPR",
  metals: "/api/metals/spot",
} as const;

export const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
};

export const DEFAULT_WEATHER_DESCRIPTION = "Weather update";
