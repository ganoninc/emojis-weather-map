// In-memory cache of fetch promises, keyed by URL. Storing the promise (not
// the data) also dedupes requests made while the first one is in flight.
const cache = new Map();

export function cachedFetchJson(url, ttlMs = Infinity) {
  const entry = cache.get(url);
  if (entry && Date.now() - entry.time < ttlMs) {
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
  cache.set(url, { promise, time: Date.now() });
  return promise;
}

export function clearFetchCache() {
  cache.clear();
}
