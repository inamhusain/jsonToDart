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
 * Drive the header rail's glass.
 *
 * Writes --hp ("header progress", 0 → 1) as the hero scrolls out of view.
 * styles/layout.css interpolates the rail's tint, hairline and blur radius off
 * that single value, so all three stay in lockstep with no per-property JS.
 *
 * Deliberately NOT gated on reduced motion: this is a state change that keeps
 * the header legible over content, not decoration.
 */
export function initHeaderProgress() {
  const hero = $(".hero");
  if (!hero) return;

  const root = document.documentElement;
  let queued = false;

  const apply = () => {
    // Fully glass by the time the hero's last quarter has passed the rail
    const span = Math.max(hero.offsetHeight * 0.75, 1);
    const hp = Math.min(Math.max(window.scrollY / span, 0), 1);
    root.style.setProperty("--hp", hp.toFixed(3));
    queued = false;
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  apply();
}

/**
 * Drift the hero's ambient light a few pixels with the pointer. Writes CSS
 * custom properties instead of styles so the easing stays in CSS; updates are
 * coalesced into one animation frame.
 */
export function initPointerParallax() {
  if (reduced) return;

  const DEPTH = 20;
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
