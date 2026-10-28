import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cachedFetchJson, clearFetchCache, getFetchTime } from "./cachedFetch";

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

it("refetches once the response has expired", async () => {
  vi.useFakeTimers();
  const getExpiry = (fetchedAt) => fetchedAt + 1000;
  await cachedFetchJson("/a", { getExpiry });
  vi.advanceTimersByTime(999);
  await cachedFetchJson("/a", { getExpiry });
  expect(fetch).toHaveBeenCalledTimes(1);

  vi.advanceTimersByTime(1);
  await cachedFetchJson("/a", { getExpiry });
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("refetches on refresh and remembers the fetch time", async () => {
  vi.useFakeTimers();
  await cachedFetchJson("/a");
  const firstFetch = getFetchTime("/a");
  vi.advanceTimersByTime(5000);
  await cachedFetchJson("/a", { refresh: true });

  expect(fetch).toHaveBeenCalledTimes(2);
  expect(getFetchTime("/a")).toBe(firstFetch + 5000);
  expect(getFetchTime("/b")).toBeNull();
});

it("does not cache failures", async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 500 });

  await expect(cachedFetchJson("/a")).rejects.toThrow("HTTP 500");
  await expect(cachedFetchJson("/a")).resolves.toEqual({ value: 1 });
  expect(fetch).toHaveBeenCalledTimes(2);
});
