import { STORAGE_KEYS } from "./config.js";
import { byId } from "./dom.js";

/**
 * Light/dark theme state.
 *
 * The <html data-theme> attribute is set pre-paint by a small inline script in
 * index.html — that has to stay inline, or the page flashes the wrong theme
 * before this module runs. This module owns every change after that point.
 *
 * Subscribers (the editors) are notified via onChange rather than imported
 * directly, so this module has no dependency on Monaco.
 */

const listeners = new Set();

export function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function readOverride() {
  try {
    return localStorage.getItem(STORAGE_KEYS.theme);
  } catch (_) {
    return null; // private mode
  }
}

function writeOverride(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch (_) {
    /* the theme still applies for this session */
  }
}

export function onChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyTheme(theme, { persist = false } = {}) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);

  if (persist) writeOverride(next);

  const toggle = byId("themeToggle");
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      next === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  for (const listener of listeners) listener(next);
}

export function toggleTheme() {
  applyTheme(currentTheme() === "dark" ? "light" : "dark", { persist: true });
}

/** Track the OS setting, but only while the user has not chosen explicitly. */
export function watchSystemTheme() {
  if (!window.matchMedia) return;

  const query = window.matchMedia("(prefers-color-scheme: light)");
  const handle = (event) => {
    if (!readOverride()) applyTheme(event.matches ? "light" : "dark");
  };

  if (query.addEventListener) query.addEventListener("change", handle);
  else if (query.addListener) query.addListener(handle);
}
