import { $$, byId, on } from "../dom.js";

/**
 * Shared modal overlay behaviour: open, close, backdrop click, Escape.
 * Individual dialogs add their own content logic on top of this.
 */

export function openDialog(id) {
  byId(id)?.classList.add("active");
}

export function closeDialog(id) {
  byId(id)?.classList.remove("active");
}

export function isDialogOpen(id) {
  return Boolean(byId(id)?.classList.contains("active"));
}

export function closeAllDialogs() {
  $$(".dialog-overlay.active").forEach((el) => el.classList.remove("active"));
}

/**
 * Wire dismissal for every overlay on the page. Clicking the backdrop closes;
 * clicking inside the card does not, because the click target is then a child.
 */
export function initDialogs() {
  for (const overlay of $$(".dialog-overlay")) {
    on(overlay, "click", (event) => {
      if (event.target === overlay) overlay.classList.remove("active");
    });
  }

  for (const button of $$("[data-close-dialog]")) {
    on(button, "click", () => closeDialog(button.dataset.closeDialog));
  }
}
