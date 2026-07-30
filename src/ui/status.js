import { byId, restartAnimation, setText } from "../dom.js";

/**
 * The status strip under the editors.
 */

const LABELS = {
  ready: "Ready",
  ok: "Generated",
  modified: "Modified",
  error: "Invalid JSON",
};

const COUNT_IDS = {
  classes: "statClasses",
  fields: "statFields",
  lines: "statLines",
};

/**
 * @param {'ready'|'ok'|'modified'|'error'} state
 * @param {string} message  free text shown on the right
 * @param {{classes: number, fields: number, lines: number}} [counts]
 */
export function setStatus(state, message, counts) {
  const bar = byId("statusbar");
  if (!bar) return;

  setText(byId("statusState"), LABELS[state] ?? state);
  bar.classList.toggle("is-error", state === "error");
  setText(byId("statusMessage"), message ?? "");

  if (!counts) return;

  for (const [key, id] of Object.entries(COUNT_IDS)) {
    // Only bump the number that actually moved.
    if (setText(byId(id), counts[key])) {
      restartAnimation(byId(id), "is-bumped");
    }
  }
}
