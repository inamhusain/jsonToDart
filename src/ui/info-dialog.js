import { $, $$, byId, on } from "../dom.js";
import { openDialog } from "./dialog.js";

const DIALOG_ID = "infoDialog";

/**
 * One dialog explaining all three generation options, opened from the ⓘ next to
 * each flag. Whichever ⓘ you press gets highlighted and scrolled to.
 */

export function initInfoDialog() {
  for (const button of $$("[data-info]")) {
    on(button, "click", () => openInfoDialog(button.dataset.info));
  }
}

export function openInfoDialog(topic) {
  const dialog = byId(DIALOG_ID);
  if (!dialog) return;

  for (const section of $$(".info-section", dialog)) {
    section.classList.remove("is-target");
  }

  openDialog(DIALOG_ID);

  const target = topic ? byId(`info-${topic}`) : null;
  if (!target) return;

  target.classList.add("is-target");

  // Jump rather than smooth-scroll: the dialog has only just appeared, so an
  // animated scroll from the top reads as a glitch.
  const body = $(".info-body", dialog);
  if (body) body.scrollTop = target.offsetTop - body.offsetTop;
}
