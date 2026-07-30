import { MONACO } from "../config.js";

/**
 * Monaco themes, kept deliberately in step with styles/tokens.css.
 * If you change a token there, change its twin here.
 */

/*
 * Every hex below is the sRGB twin of an OKLCH token in styles/tokens.css.
 * The token's value is named in the comment — if you change one, change both.
 *   gold   #fab72a  oklch(82% .16 80)     numbers, cursor, JSON literals
 *   patina #61ccc3  oklch(78% .10 188)    JSON keys, Dart types
 */
const DARK = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "5a5852", fontStyle: "italic" }, // --tk-cm
    { token: "keyword", foreground: "b28fef" }, // --tk-kw
    { token: "string", foreground: "e7ce9d" }, // --tk-st, kinpaku-pale
    { token: "string.key.json", foreground: "61ccc3" }, // --tk-cl, patina
    { token: "string.value.json", foreground: "e7ce9d" },
    { token: "number", foreground: "fab72a" }, // --tk-num, gold
    { token: "keyword.json", foreground: "fab72a" },
    { token: "type", foreground: "61ccc3" },
    { token: "type.identifier", foreground: "61ccc3" },
    { token: "delimiter", foreground: "878683" },
  ],
  colors: {
    "editor.background": "#070605", // --code-bg
    "editor.foreground": "#e1e1e1", // --ink, champagne
    "editorLineNumber.foreground": "#43423f",
    "editorLineNumber.activeForeground": "#a4a4a4", // --ink-2
    "editor.selectionBackground": "#fab72a33",
    "editor.inactiveSelectionBackground": "#fab72a1c",
    "editor.lineHighlightBackground": "#12100d", // --panel
    "editorCursor.foreground": "#fab72a",
    "editorIndentGuide.background": "#252420",
    "editorIndentGuide.activeBackground": "#3a3833",
    "editorGutter.background": "#070605",
    // Left unset, the ruler draws its own edge line against the pane border
    "editorOverviewRuler.border": "#00000000",
    "editorBracketMatch.background": "#fab72a20",
    "editorBracketMatch.border": "#fab72a70",
    "scrollbarSlider.background": "#1a1813", // --panel-2
    "scrollbarSlider.hoverBackground": "#211f1a", // --panel-3
    "scrollbarSlider.activeBackground": "#312e28",
    "editorWidget.background": "#12100d",
    "editorWidget.border": "#2a2822",
  },
};

const LIGHT = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "82807a", fontStyle: "italic" }, // --tk-cm
    { token: "keyword", foreground: "6a37bf" }, // --tk-kw
    { token: "string", foreground: "2f6d34" }, // --tk-st
    { token: "string.key.json", foreground: "0d726c" }, // --tk-cl, patina
    { token: "string.value.json", foreground: "2f6d34" },
    { token: "number", foreground: "8e5e01" }, // --tk-num
    { token: "keyword.json", foreground: "8e5e01" },
    { token: "type", foreground: "0d726c" },
    { token: "type.identifier", foreground: "0d726c" },
    { token: "delimiter", foreground: "6b6963" },
  ],
  colors: {
    "editor.background": "#fefdfb", // --code-bg, washi
    "editor.foreground": "#1d1b13", // --ink, sumi
    "editorLineNumber.foreground": "#b0aea7",
    "editorLineNumber.activeForeground": "#4f4d46", // --ink-2
    "editor.selectionBackground": "#fab72a5c",
    "editor.inactiveSelectionBackground": "#fab72a33",
    "editor.lineHighlightBackground": "#f7f5ef", // --canvas
    "editorCursor.foreground": "#af7b11", // --accent-line
    "editorIndentGuide.background": "#e9e7e0",
    "editorIndentGuide.activeBackground": "#cfcdc4",
    "editorGutter.background": "#fefdfb",
    "editorOverviewRuler.border": "#00000000",
    "editorBracketMatch.background": "#fab72a3d",
    "editorBracketMatch.border": "#af7b1199",
    "scrollbarSlider.background": "#e6e5dd", // --panel-3
    "scrollbarSlider.hoverBackground": "#d4d2c9",
    "scrollbarSlider.activeBackground": "#bcbab1",
    "editorWidget.background": "#fefdfb",
    "editorWidget.border": "#e6e5dd",
  },
};

export function defineEditorThemes(monaco) {
  monaco.editor.defineTheme(MONACO.themes.dark, DARK);
  monaco.editor.defineTheme(MONACO.themes.light, LIGHT);
}

export const EDITOR_OPTIONS = {
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  lineHeight: 22,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontLigatures: true,
  padding: { top: 16, bottom: 16 },
  renderLineHighlight: "gutter",
  lineNumbers: "on",
  folding: true,
  bracketPairColorization: { enabled: true },
  smoothScrolling: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: true,
};
