import { TIMING } from "../config.js";
import { byId } from "../dom.js";

let hideTimer = null;

/**
 * Transient confirmation, bottom right. The toast markup keeps its icon and
 * puts the message in a dedicated span so we are not poking at text nodes.
 */
export function showToast(message) {
  const toast = byId("toast");
  if (!toast) return;

  const label = byId("toastMessage");
  if (label) label.textContent = message;

  toast.classList.add("show");

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove("show"), TIMING.toastMs);
}
