import { byId, on } from "../dom.js";

/**
 * The options row: class name, the three flags, and the prefix field.
 *
 * Each flag is a <label> wrapping a visually hidden checkbox, so clicking the
 * label toggles it natively. We listen for `change` rather than handling clicks
 * and flipping `checked` ourselves — doing both fights the browser's own label
 * activation and is easy to double-toggle by accident.
 */

const FLAGS = [
  { checkbox: "fromJsonCheck", pill: "fromJsonPill" },
  { checkbox: "toJsonCheck", pill: "toJsonPill" },
  { checkbox: "usePrefixCheck", pill: "prefixPill" },
];

export function initToolbar({ onChange }) {
  for (const { checkbox, pill } of FLAGS) {
    on(byId(checkbox), "change", () => {
      syncFlagAppearance();
      onChange();
    });
  }

  // Typing a prefix changes the output, so regenerate on input.
  on(byId("prefixInput"), "input", onChange);

  syncFlagAppearance();
}

/** Mirror checkbox state onto the pills and the prefix field's visibility. */
function syncFlagAppearance() {
  for (const { checkbox, pill } of FLAGS) {
    const isChecked = Boolean(byId(checkbox)?.checked);
    byId(pill)?.classList.toggle("checked", isChecked);
  }

  byId("prefixWrap")?.classList.toggle(
    "is-visible",
    Boolean(byId("usePrefixCheck")?.checked)
  );
}

/** Everything the generator needs from this row. */
export function readOptions() {
  const usePrefix = Boolean(byId("usePrefixCheck")?.checked);

  return {
    className: byId("classNameInput")?.value.trim() ?? "",
    includeFromJson: Boolean(byId("fromJsonCheck")?.checked),
    includeToJson: Boolean(byId("toJsonCheck")?.checked),
    prefix: usePrefix ? (byId("prefixInput")?.value.trim() ?? "") : "",
  };
}

/** Restore the row from a history entry. */
export function applyOptions({ className, fromJson, toJson, usePrefix, prefix }) {
  byId("classNameInput").value = className || "";
  byId("fromJsonCheck").checked = fromJson !== false;
  byId("toJsonCheck").checked = toJson !== false;
  byId("usePrefixCheck").checked = Boolean(usePrefix);
  byId("prefixInput").value = prefix || "";

  // Setting `checked` in script does not fire `change`, so sync by hand.
  syncFlagAppearance();
}

export function getClassName() {
  return byId("classNameInput")?.value.trim() ?? "";
}

export function setClassName(name) {
  const input = byId("classNameInput");
  if (input) input.value = name;
}

/** Show the platform's real modifier on the Generate keycap. */
export function labelShortcut() {
  const kbd = byId("generateKbd");
  if (!kbd) return;

  const platform =
    navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;

  if (!/Mac|iPhone|iPad|iPod/.test(platform)) kbd.textContent = "Ctrl↵";
}

/** Reflect whether the output pane currently holds valid generated code. */
export function setOutputHealthy(isHealthy) {
  byId("outputDot")?.classList.toggle("active", isHealthy);
}
