import { MONACO } from "../config.js";

/**
 * Monaco themes, kept deliberately in step with styles/tokens.css.
 * If you change a token there, change its twin here.
 */

const DARK = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "5a5a64", fontStyle: "italic" },
    { token: "keyword", foreground: "c4a0ff" },
    { token: "string", foreground: "86efac" },
    { token: "string.key.json", foreground: "7dd3fc" },
    { token: "string.value.json", foreground: "86efac" },
    { token: "number", foreground: "f5c518" },
    { token: "keyword.json", foreground: "f5c518" },
    { token: "type", foreground: "7dd3fc" },
    { token: "type.identifier", foreground: "7dd3fc" },
    { token: "delimiter", foreground: "8a8a94" },
  ],
  colors: {
    "editor.background": "#0e0e10",
    "editor.foreground": "#ededef",
    "editorLineNumber.foreground": "#3a3a42",
    "editorLineNumber.activeForeground": "#a1a1aa",
    "editor.selectionBackground": "#f5c5182e",
    "editor.inactiveSelectionBackground": "#f5c5181a",
    "editor.lineHighlightBackground": "#16161a",
    "editorCursor.foreground": "#f5c518",
    "editorIndentGuide.background": "#23232a",
    "editorIndentGuide.activeBackground": "#35353d",
    "editorGutter.background": "#0e0e10",
    "editorBracketMatch.background": "#f5c5181f",
    "editorBracketMatch.border": "#f5c51866",
    "scrollbarSlider.background": "#26262b",
    "scrollbarSlider.hoverBackground": "#35353d",
    "scrollbarSlider.activeBackground": "#43434d",
    "editorWidget.background": "#16161a",
    "editorWidget.border": "#26262b",
  },
};

const LIGHT = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "83838c", fontStyle: "italic" },
    { token: "keyword", foreground: "7c3aed" },
    { token: "string", foreground: "15803d" },
    { token: "string.key.json", foreground: "0369a1" },
    { token: "string.value.json", foreground: "15803d" },
    { token: "number", foreground: "b45309" },
    { token: "keyword.json", foreground: "b45309" },
    { token: "type", foreground: "0369a1" },
    { token: "type.identifier", foreground: "0369a1" },
    { token: "delimiter", foreground: "70707a" },
  ],
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#17171a",
    "editorLineNumber.foreground": "#bcbcb6",
    "editorLineNumber.activeForeground": "#55555c",
    "editor.selectionBackground": "#f5c51859",
    "editor.inactiveSelectionBackground": "#f5c51830",
    "editor.lineHighlightBackground": "#f7f7f4",
    "editorCursor.foreground": "#a16207",
    "editorIndentGuide.background": "#ededea",
    "editorIndentGuide.activeBackground": "#d6d6d0",
    "editorGutter.background": "#ffffff",
    "editorBracketMatch.background": "#f5c51833",
    "editorBracketMatch.border": "#c77f0088",
    "scrollbarSlider.background": "#e3e3de",
    "scrollbarSlider.hoverBackground": "#cfcfc8",
    "scrollbarSlider.activeBackground": "#b8b8b0",
    "editorWidget.background": "#ffffff",
    "editorWidget.border": "#e3e3de",
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
