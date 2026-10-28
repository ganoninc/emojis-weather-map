import { expect, it } from "vitest";
import { getWeatherExpiry } from "./weatherSchedule";

const at = (hours, minutes, seconds = 0) =>
  Date.UTC(2026, 9, 28, hours, minutes, seconds);

it("expires once the next quarter-hour update is published", () => {
  expect(getWeatherExpiry(at(10, 2))).toBe(at(10, 16));
  expect(getWeatherExpiry(at(10, 14, 30))).toBe(at(10, 16));
});

it("waits for the following update once the current one is out", () => {
  expect(getWeatherExpiry(at(10, 15, 30))).toBe(at(10, 16));
  expect(getWeatherExpiry(at(10, 16))).toBe(at(10, 31));
  expect(getWeatherExpiry(at(10, 30))).toBe(at(10, 31));
});
