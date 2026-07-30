/**
 * Single source of truth for constants. Nothing here reaches the DOM.
 */

export const STORAGE_KEYS = {
  theme: "json_to_dart_theme",
  history: "json_to_dart_history_v1",
};

export const HISTORY_LIMIT = 8;

export const DEFAULT_CLASS_NAME = "RootModel";

export const MONACO = {
  cdn: "https://unpkg.com/monaco-editor@0.52.2/min/vs",
  themes: { dark: "jsonToDartDark", light: "jsonToDartLight" },
};

export const TIMING = {
  toastMs: 2000,
  freshPaneMs: 750,
};

export const SAMPLE_JSON = JSON.stringify(
  {
    id: 1,
    name: "Flutter",
    isActive: true,
    score: 9.5,
    address: { city: "San Francisco", zip: "94102" },
  },
  null,
  2
);
