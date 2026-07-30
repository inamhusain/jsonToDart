/**
 * Thin DOM helpers. Deliberately tiny — this is not a framework, it just keeps
 * the widget modules from being a wall of document.getElementById.
 */

export const byId = (id) => document.getElementById(id);

export const $ = (selector, root = document) => root.querySelector(selector);

export const $$ = (selector, root = document) => [
  ...root.querySelectorAll(selector),
];

export function on(target, type, handler, options) {
  if (target) target.addEventListener(type, handler, options);
}

/** Set textContent only when it actually changed. Returns true if it did. */
export function setText(el, value) {
  if (!el) return false;
  const next = String(value);
  if (el.textContent === next) return false;
  el.textContent = next;
  return true;
}

/**
 * Re-trigger a CSS animation. Removing the class and reading a layout property
 * forces a style flush, so re-adding it starts the animation over.
 */
export function restartAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

export function prefersReducedMotion() {
  return Boolean(
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
