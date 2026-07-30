import { HISTORY_LIMIT, STORAGE_KEYS } from "../config.js";

/**
 * localStorage persistence for recent generations. No DOM here.
 */

export function readHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (_) {
    return []; // corrupt or unavailable storage — behave as if empty
  }
}

/** Two entries are the same generation if every input matches. */
function isSameEntry(a, b) {
  return (
    a.className === b.className &&
    a.json === b.json &&
    a.fromJson === b.fromJson &&
    a.toJson === b.toJson &&
    a.usePrefix === b.usePrefix &&
    a.prefix === b.prefix
  );
}

/**
 * Push an entry to the front, dropping any earlier identical one so repeated
 * generations do not fill the list.
 */
export function saveEntry(entry) {
  const snapshot = { id: Date.now(), savedAt: new Date().toISOString(), ...entry };
  const kept = readHistory().filter((existing) => !isSameEntry(existing, snapshot));

  try {
    localStorage.setItem(
      STORAGE_KEYS.history,
      JSON.stringify([snapshot, ...kept].slice(0, HISTORY_LIMIT))
    );
  } catch (_) {
    /* quota or private mode — history is a convenience, not critical */
  }

  return snapshot;
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.history);
  } catch (_) {
    /* nothing to do */
  }
}

export function findEntry(id) {
  return readHistory().find((entry) => String(entry.id) === String(id)) ?? null;
}
