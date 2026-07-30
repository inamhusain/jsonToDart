import { TIMING } from "../config.js";
import { $, prefersReducedMotion, restartAnimation } from "../dom.js";

/**
 * JS-driven motion. Everything here is a no-op when the user asks for reduced
 * motion; the CSS-only animations are disabled by a media query in
 * styles/motion.css.
 */

const reduced = prefersReducedMotion();
let freshTimer = null;

/** Sweep the output pane header when fresh code lands. */
export function flashOutputPane() {
  if (reduced) return;

  const pane = $(".pane-output");
  if (!pane) return;

  restartAnimation(pane, "is-fresh");
  clearTimeout(freshTimer);
  freshTimer = setTimeout(() => pane.classList.remove("is-fresh"), TIMING.freshPaneMs);
}

/**
 * Drift the dot grid a few pixels with the pointer. Writes CSS custom
 * properties instead of styles so the easing stays in CSS; updates are
 * coalesced into one animation frame.
 */
export function initPointerParallax() {
  if (reduced) return;

  const DEPTH = 14;
  let queued = false;
  let x = 0;
  let y = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      x = (event.clientX / window.innerWidth - 0.5) * DEPTH;
      y = (event.clientY / window.innerHeight - 0.5) * DEPTH;

      if (queued) return;
      queued = true;

      requestAnimationFrame(() => {
        const root = document.documentElement.style;
        root.setProperty("--px", `${x.toFixed(1)}px`);
        root.setProperty("--py", `${y.toFixed(1)}px`);
        queued = false;
      });
    },
    { passive: true }
  );
}
