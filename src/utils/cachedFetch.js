// In-memory cache of fetch promises, keyed by URL. Storing the promise (not
// the data) also dedupes requests made while the first one is in flight.
const cache = new Map();

// `getExpiry(fetchedAt)` returns when the response goes stale (never by
// default); `refresh` skips the cached one.
export function cachedFetchJson(
  url,
  { getExpiry = () => Infinity, refresh = false } = {}
) {
  const entry = cache.get(url);
  if (entry && !refresh && Date.now() < entry.expiresAt) {
    return entry.promise;
  }

  const promise = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    return response.json();
  });
  // Failed requests aren't cached, so the next visit retries.
  promise.catch(() => cache.delete(url));
  const time = Date.now();
  cache.set(url, { promise, time, expiresAt: getExpiry(time) });
  return promise;
}

// When the cached response for `url` was fetched, or null.
export function getFetchTime(url) {
  const entry = cache.get(url);
  return entry ? entry.time : null;
}

export function clearFetchCache() {
  cache.clear();
}
