import React from "react";
import ReactDOM from "react-dom";
import { afterEach, beforeEach, it, vi } from "vitest";
import App from "./App";
import { clearFetchCache } from "./utils/cachedFetch";

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

  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
