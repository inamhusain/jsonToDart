import { MONACO, SAMPLE_JSON } from "../config.js";
import { byId } from "../dom.js";
import { defineEditorThemes, EDITOR_OPTIONS } from "./themes.js";

/**
 * Owns the two Monaco instances. Everything else talks to the editors through
 * this module, so Monaco's API stays in one place.
 */

let input = null;
let output = null;

/** Monaco ships as an AMD bundle; the loader script in index.html provides require(). */
function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (typeof window.require !== "function") {
      reject(new Error("Monaco loader script did not load"));
      return;
    }
    window.require.config({ paths: { vs: MONACO.cdn } });
    window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
  });
}

/**
 * @param {object}   handlers
 * @param {'dark'|'light'} handlers.theme     theme to start in
 * @param {Function} handlers.onInputChange   payload was edited
 * @param {Function} handlers.onRun           Cmd/Ctrl+Enter inside an editor
 */
export async function initEditors({ theme, onInputChange, onRun }) {
  const monaco = await loadMonaco();
  defineEditorThemes(monaco);

  const shared = { ...EDITOR_OPTIONS, theme: MONACO.themes[theme] };

  input = monaco.editor.create(byId("jsonEditor"), {
    ...shared,
    value: SAMPLE_JSON,
    language: "json",
  });

  output = monaco.editor.create(byId("outputEditor"), {
    ...shared,
    value: "",
    language: "dart",
    readOnly: true,
  });

  // Monaco swallows keydown while focused, so the shortcut is registered here
  // as well as on document (see src/main.js).
  const runShortcut = monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter;
  input.addCommand(runShortcut, onRun);
  output.addCommand(runShortcut, onRun);

  input.onDidChangeModelContent(() => onInputChange());
}

export const isReady = () => Boolean(input && output);

export const getInput = () => (input ? input.getValue() : "");
export const setInput = (value) => input && input.setValue(value);

export const getOutput = () => (output ? output.getValue() : "");
export const setOutput = (value) => output && output.setValue(value);

export function setTheme(themeName) {
  if (window.monaco) window.monaco.editor.setTheme(MONACO.themes[themeName]);
}
