import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";
import { clearFetchCache } from "./utils/cachedFetch";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  clearFetchCache();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);

  act(() => {
    root.render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
  });
  act(() => root.unmount());
});

function renderAt(path) {
  const div = document.createElement("div");
  const root = createRoot(div);
  let location;
  function LocationSpy() {
    location = useLocation();
    return null;
  }
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:country?" element={<App />} />
        </Routes>
        <LocationSpy />
      </MemoryRouter>,
    );
  });
  return { div, root, getLocation: () => location };
}

it("loads the country from the URL", () => {
  const { div, root } = renderAt("/japan");

  expect(div.querySelector("input").value).toContain("Japan");
  expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/templates\/japan\.json$/));
  act(() => root.unmount());
});

it("redirects an unknown country to the default one", () => {
  const { div, root, getLocation } = renderAt("/atlantis");

  expect(getLocation().pathname).toBe("/");
  expect(div.querySelector("input").value).toContain("France");
  act(() => root.unmount());
});
