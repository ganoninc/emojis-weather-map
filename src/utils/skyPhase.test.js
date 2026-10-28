import { describe, expect, it } from "vitest";
import { getLocationSkyPhase, getSkyPhase } from "./skyPhase";

const MINUTE = 60 * 1000;
const sunrise = Date.UTC(2026, 9, 28, 6, 0);
const sunset = Date.UTC(2026, 9, 28, 17, 0);
const location = { sunrise, sunset, isDay: true };

describe("getLocationSkyPhase", () => {
  it("is dawn around sunrise", () => {
    expect(getLocationSkyPhase(location, sunrise - 31 * MINUTE)).toBe("night");
    expect(getLocationSkyPhase(location, sunrise - 30 * MINUTE)).toBe("dawn");
    expect(getLocationSkyPhase(location, sunrise + 44 * MINUTE)).toBe("dawn");
    expect(getLocationSkyPhase(location, sunrise + 45 * MINUTE)).toBe("day");
  });

  it("is dusk around sunset", () => {
    expect(getLocationSkyPhase(location, sunset - 46 * MINUTE)).toBe("day");
    expect(getLocationSkyPhase(location, sunset - 45 * MINUTE)).toBe("dusk");
    expect(getLocationSkyPhase(location, sunset + 29 * MINUTE)).toBe("dusk");
    expect(getLocationSkyPhase(location, sunset + 30 * MINUTE)).toBe("night");
  });

  it("falls back to isDay without sun times", () => {
    expect(getLocationSkyPhase({ isDay: true }, sunrise)).toBe("day");
    expect(getLocationSkyPhase({ isDay: false }, sunrise)).toBe("night");
  });
});

describe("getSkyPhase", () => {
  it("picks the phase shared by most locations", () => {
    const west = { sunrise: sunrise + 60 * MINUTE, sunset: sunset + 60 * MINUTE };
    const polarNight = { isDay: false };
    expect(getSkyPhase([location, west, polarNight], sunset + 20 * MINUTE)).toBe("dusk");
    expect(getSkyPhase([location, location, west], sunset + 40 * MINUTE)).toBe("night");
  });

  it("is day when nothing is known", () => {
    expect(getSkyPhase([], sunrise)).toBe("day");
  });
});
