// Open-Meteo updates its current conditions every 15 minutes, on the quarter
// hour (UTC offsets are all multiples of 15 minutes, so this holds in every
// time zone).
const WEATHER_UPDATE_INTERVAL = 15 * 60 * 1000;
// Margin for the new conditions to be published after the quarter hour.
const WEATHER_PUBLISH_DELAY = 60 * 1000;

// When weather fetched at `fetchedAt` (ms) goes stale: the next update
// published after it. Shared by the fetch cache and the auto-refresh so the
// two always agree.
export function getWeatherExpiry(fetchedAt) {
  const slot = Math.floor(
    (fetchedAt - WEATHER_PUBLISH_DELAY) / WEATHER_UPDATE_INTERVAL
  );
  return (slot + 1) * WEATHER_UPDATE_INTERVAL + WEATHER_PUBLISH_DELAY;
}
