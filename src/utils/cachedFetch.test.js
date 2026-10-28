import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cachedFetchJson, clearFetchCache } from "./cachedFetch";

beforeEach(() => {
  clearFetchCache();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ value: 1 }),
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("fetches a URL only once", async () => {
  await cachedFetchJson("/a");
  const data = await cachedFetchJson("/a");

  expect(data).toEqual({ value: 1 });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("shares an in-flight request", async () => {
  await Promise.all([cachedFetchJson("/a"), cachedFetchJson("/a")]);

  expect(fetch).toHaveBeenCalledTimes(1);
});

it("refetches once the TTL has expired", async () => {
  vi.useFakeTimers();
  await cachedFetchJson("/a", 1000);
  vi.advanceTimersByTime(1001);
  await cachedFetchJson("/a", 1000);

  expect(fetch).toHaveBeenCalledTimes(2);
});

it("does not cache failures", async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 500 });

  await expect(cachedFetchJson("/a")).rejects.toThrow("HTTP 500");
  await expect(cachedFetchJson("/a")).resolves.toEqual({ value: 1 });
  expect(fetch).toHaveBeenCalledTimes(2);
});
