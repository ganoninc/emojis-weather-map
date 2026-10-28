import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";

beforeEach(() => {
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

  ReactDOM.render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});

function renderAt(path) {
  const div = document.createElement("div");
  let location;
  function LocationSpy() {
    location = useLocation();
    return null;
  }
  act(() => {
    ReactDOM.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:country?" element={<App />} />
        </Routes>
        <LocationSpy />
      </MemoryRouter>,
      div,
    );
  });
  return { div, getLocation: () => location };
}

it("loads the country from the URL", () => {
  const { div } = renderAt("/japan");

  expect(div.querySelector("input").value).toContain("Japan");
  expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/templates\/japan\.json$/));
  ReactDOM.unmountComponentAtNode(div);
});

it("redirects an unknown country to the default one", () => {
  const { div, getLocation } = renderAt("/atlantis");

  expect(getLocation().pathname).toBe("/");
  expect(div.querySelector("input").value).toContain("France");
  ReactDOM.unmountComponentAtNode(div);
});
