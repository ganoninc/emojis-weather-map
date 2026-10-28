// Golden hour around sunrise and sunset, in milliseconds.
const GOLDEN_HOUR_BEFORE_SUN = 30 * 60 * 1000;
const GOLDEN_HOUR_AFTER_SUN = 45 * 60 * 1000;

export const SKY_PHASES = ["day", "dawn", "dusk", "night"];

// The sky at one location: "dawn" and "dusk" are the golden hours around
// sunrise and sunset (the low sun is on the "day" side for longer), "day" and
// "night" the rest. Falls back to is_day when the sun times are unknown (e.g.
// polar day or night).
export function getLocationSkyPhase(weather, now) {
  const { sunrise, sunset } = weather;
  if (!sunrise || !sunset) {
    return weather.isDay ? "day" : "night";
  }
  if (now >= sunrise - GOLDEN_HOUR_BEFORE_SUN && now < sunrise + GOLDEN_HOUR_AFTER_SUN) {
    return "dawn";
  }
  if (now >= sunset - GOLDEN_HOUR_AFTER_SUN && now < sunset + GOLDEN_HOUR_BEFORE_SUN) {
    return "dusk";
  }
  return now >= sunrise && now < sunset ? "day" : "night";
}

// The sky shared by most of the country's locations. Ties go to the earliest
// phase in SKY_PHASES.
export function getSkyPhase(weathers, now) {
  const counts = {};
  weathers.forEach((weather) => {
    const phase = getLocationSkyPhase(weather, now);
    counts[phase] = (counts[phase] || 0) + 1;
  });
  return SKY_PHASES.reduce(
    (main, phase) => ((counts[phase] || 0) > (counts[main] || 0) ? phase : main),
    "day"
  );
}
