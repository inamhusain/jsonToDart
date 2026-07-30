let jsonEditor, outputEditor;
const HISTORY_KEY = "json_to_dart_history_v1";
const HISTORY_LIMIT = 8;
const THEME_KEY = "json_to_dart_theme";
let selectedHistoryId = null;
let monacoReady = false;

const APP_VERSION = window.APP_VERSION || "v1.0.0";

/* ==========================================================================
   THEME
   The <html data-theme> attribute is set pre-paint by an inline script in
   index.html. This module keeps it, localStorage, and Monaco in sync.
   ========================================================================== */

const MONACO_THEME = { dark: "jsonToDartDark", light: "jsonToDartLight" };

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function applyTheme(theme, persist) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);

  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (_) {
      /* private mode — the theme still applies for this session */
    }
  }

  if (monacoReady) {
    monaco.editor.setTheme(MONACO_THEME[next]);
  }

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      next === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }
}

function toggleTheme() {
  applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
}

// Follow the OS only while the user has not made an explicit choice.
(function watchSystemTheme() {
  if (!window.matchMedia) return;
  const query = window.matchMedia("(prefers-color-scheme: light)");
  const onChange = (event) => {
    let hasOverride = false;
    try {
      hasOverride = !!localStorage.getItem(THEME_KEY);
    } catch (_) {
      /* treat unreadable storage as no override */
    }
    if (!hasOverride) applyTheme(event.matches ? "light" : "dark", false);
  };

  if (query.addEventListener) query.addEventListener("change", onChange);
  else if (query.addListener) query.addListener(onChange);
})();

require.config({
  paths: { vs: "https://unpkg.com/monaco-editor@0.52.2/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  monaco.editor.defineTheme(MONACO_THEME.dark, {
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
  });

  monaco.editor.defineTheme(MONACO_THEME.light, {
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
  });

  monacoReady = true;

  const sharedOpts = {
    theme: MONACO_THEME[currentTheme()],
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

  jsonEditor = monaco.editor.create(document.getElementById("jsonEditor"), {
    ...sharedOpts,
    value:
      '{\n  "id": 1,\n  "name": "Flutter",\n  "isActive": true,\n  "score": 9.5,\n  "address": {\n    "city": "San Francisco",\n    "zip": "94102"\n  }\n}',
    language: "json",
  });

  outputEditor = monaco.editor.create(
    document.getElementById("outputEditor"),
    {
      ...sharedOpts,
      value: "",
      language: "dart",
      readOnly: true,
    }
  );

  const versionChip = document.getElementById("versionChip");
  if (versionChip) {
    versionChip.textContent = APP_VERSION;
  }

  // Cmd/Ctrl+Enter generates. Registered on the editors too, since Monaco
  // swallows keydown while focused.
  const runShortcut = monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter;
  jsonEditor.addCommand(runShortcut, generateDart);
  outputEditor.addCommand(runShortcut, generateDart);

  // Editing the payload makes the current output stale.
  jsonEditor.onDidChangeModelContent(() => {
    if (outputEditor.getValue().trim()) {
      setStatus("modified", "Payload changed — regenerate to update output");
    }
  });

  hydrateHistory();
  setStatus("ready", "Paste JSON, then generate");
});

// Same shortcut when focus is outside the editors
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    generateDart();
  }
  if (event.key === "Escape") {
    closeHistoryDialog();
    closeInfoDialog();
  }
});

// Show the modifier that actually applies on this platform
function labelGenerateShortcut() {
  const kbd = document.getElementById("generateKbd");
  if (!kbd) return;
  const platform =
    (navigator.userAgentData && navigator.userAgentData.platform) ||
    navigator.platform ||
    navigator.userAgent;
  if (!/Mac|iPhone|iPad|iPod/.test(platform)) kbd.textContent = "Ctrl↵";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", labelGenerateShortcut);
} else {
  labelGenerateShortcut();
}

/* ==========================================================================
   STATUS STRIP
   ========================================================================== */

function setStatus(state, message, counts) {
  const bar = document.getElementById("statusbar");
  const stateEl = document.getElementById("statusState");
  const messageEl = document.getElementById("statusMessage");
  if (!bar || !stateEl) return;

  const labels = { ready: "Ready", ok: "Generated", modified: "Modified", error: "Invalid JSON" };
  stateEl.textContent = labels[state] || state;
  bar.classList.toggle("is-error", state === "error");

  if (messageEl) messageEl.textContent = message || "";

  if (counts) {
    setCount("statClasses", counts.classes);
    setCount("statFields", counts.fields);
    setCount("statLines", counts.lines);
  }
}

// Re-trigger the bump animation only when the number actually moves
function setCount(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  const next = String(value);
  if (el.textContent === next) return;

  el.textContent = next;
  el.classList.remove("is-bumped");
  void el.offsetWidth; // force a reflow so the animation restarts
  el.classList.add("is-bumped");
}

/* ==========================================================================
   MOTION
   ========================================================================== */

const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Flash the output pane when fresh code lands
function flashOutputPane() {
  if (prefersReducedMotion) return;

  const pane = document.querySelector(".pane-output");
  if (!pane) return;

  pane.classList.remove("is-fresh");
  void pane.offsetWidth;
  pane.classList.add("is-fresh");
  setTimeout(() => pane.classList.remove("is-fresh"), 750);
}

// Dot grid drifts a few pixels with the pointer — coalesced into one rAF
(function pointerParallax() {
  if (prefersReducedMotion) return;

  let queued = false;
  let x = 0;
  let y = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      x = (event.clientX / window.innerWidth - 0.5) * 14;
      y = (event.clientY / window.innerHeight - 0.5) * 14;

      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--px", `${x.toFixed(1)}px`);
        document.documentElement.style.setProperty("--py", `${y.toFixed(1)}px`);
        queued = false;
      });
    },
    { passive: true }
  );
})();

function togglePill(pill, checkId) {
  const check = document.getElementById(checkId);
  check.checked = !check.checked;
  pill.classList.toggle("checked", check.checked);

  if (checkId === "usePrefixCheck") {
    document.getElementById("prefixWrap").style.display = check.checked
      ? "block"
      : "none";
  }
  generateDart();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const textNode = toast.childNodes[toast.childNodes.length - 1];
  if (textNode) {
    textNode.textContent = ` ${message}`;
  }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function openHistoryDialog() {
  selectedHistoryId = null;
  renderHistoryDialog();
  document.getElementById("historyDialog").classList.add("active");
}

function closeHistoryDialog(event) {
  if (event && event.target !== document.getElementById("historyDialog")) return;
  document.getElementById("historyDialog").classList.remove("active");
}

/* ==========================================================================
   INFO DIALOG — one dialog, three sections, scrolled to whichever ⓘ you hit
   ========================================================================== */

function openInfoDialog(topic) {
  const dialog = document.getElementById("infoDialog");
  if (!dialog) return;

  dialog.querySelectorAll(".info-section").forEach((section) => {
    section.classList.remove("is-target");
  });

  dialog.classList.add("active");

  const target = topic && document.getElementById(`info-${topic}`);
  if (target) {
    target.classList.add("is-target");
    // Jump without smooth-scrolling: the dialog has only just been revealed,
    // so an animated scroll from the top reads as a glitch.
    const body = dialog.querySelector(".info-body");
    if (body) body.scrollTop = target.offsetTop - body.offsetTop;
  }
}

function closeInfoDialog(event) {
  if (event && event.target !== document.getElementById("infoDialog")) return;
  document.getElementById("infoDialog").classList.remove("active");
}

function getHistorySnapshot() {
  return {
    id: Date.now(),
    savedAt: new Date().toISOString(),
    className: document.getElementById("classNameInput").value.trim(),
    json: jsonEditor.getValue(),
    fromJson: document.getElementById("fromJsonCheck").checked,
    toJson: document.getElementById("toJsonCheck").checked,
    usePrefix: document.getElementById("usePrefixCheck").checked,
    prefix: document.getElementById("prefixInput").value.trim(),
  };
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch (_) {
    return [];
  }
}

function saveHistory() {
  const snapshot = getHistorySnapshot();
  const entries = readHistory();
  const deduped = entries.filter(
    (entry) =>
      !(
        entry.className === snapshot.className &&
        entry.json === snapshot.json &&
        entry.fromJson === snapshot.fromJson &&
        entry.toJson === snapshot.toJson &&
        entry.usePrefix === snapshot.usePrefix &&
        entry.prefix === snapshot.prefix
      )
  );

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify([snapshot, ...deduped].slice(0, HISTORY_LIMIT))
  );
  hydrateHistory();
  if (document.getElementById("historyDialog").classList.contains("active")) {
    renderHistoryDialog();
  }
}

function hydrateHistory() {
  renderHistoryDialog();
}

function getHistoryPreviewText(entry) {
  if (!entry) return "No history selected.";
  try {
    const parsed = JSON.parse(entry.json || "{}");
    return JSON.stringify(parsed, null, 2).slice(0, 700);
  } catch (_) {
    return (entry.json || "").slice(0, 700);
  }
}

function selectHistoryEntry(id) {
  selectedHistoryId = String(id);
  renderHistoryDialog();
}

function renderHistoryDialog() {
  const listEl = document.getElementById("historyList");
  const previewEl = document.getElementById("historyPreviewContent");
  const metaEl = document.getElementById("historyPreviewMeta");
  const loadBtn = document.getElementById("historyLoadBtn");

  if (!listEl || !previewEl || !metaEl || !loadBtn) return;

  const entries = readHistory();
  listEl.innerHTML = "";

  if (!entries.length) {
    listEl.innerHTML = `<div class="history-empty">No local history yet. Generate something once and it will appear here.</div>`;
    previewEl.textContent = "No history selected.";
    metaEl.textContent = "Select a history item";
    loadBtn.disabled = true;
    return;
  }

  if (!selectedHistoryId || !entries.some((entry) => String(entry.id) === selectedHistoryId)) {
    selectedHistoryId = String(entries[0].id);
  }

  entries.forEach((entry) => {
    const button = document.createElement("button");
    button.className = `history-tile${String(entry.id) === selectedHistoryId ? " active" : ""}`;
    button.type = "button";
    button.onclick = () => selectHistoryEntry(entry.id);
    button.innerHTML = `
      <span class="history-tile-title">${entry.className || "RootModel"}</span>
      <span class="history-tile-meta">${new Date(entry.savedAt).toLocaleString()}</span>
      <span class="history-tile-snippet">${(entry.json || "").replace(/\s+/g, " ").slice(0, 110)}</span>
    `;
    listEl.appendChild(button);
  });

  const selectedEntry = entries.find((entry) => String(entry.id) === selectedHistoryId);
  previewEl.textContent = getHistoryPreviewText(selectedEntry);
  metaEl.textContent = selectedEntry
    ? `${selectedEntry.className || "RootModel"} • ${new Date(selectedEntry.savedAt).toLocaleString()}`
    : "Select a history item";
  loadBtn.disabled = !selectedEntry;
}

function loadSelectedHistory() {
  if (!selectedHistoryId) return;
  const entry = readHistory().find((item) => String(item.id) === selectedHistoryId);
  if (!entry) return;

  document.getElementById("classNameInput").value = entry.className || "";
  document.getElementById("fromJsonCheck").checked = entry.fromJson !== false;
  document.getElementById("toJsonCheck").checked = entry.toJson !== false;
  document.getElementById("usePrefixCheck").checked = !!entry.usePrefix;
  document.getElementById("prefixInput").value = entry.prefix || "";
  document.getElementById("prefixWrap").style.display = entry.usePrefix ? "block" : "none";
  document.getElementById("fromJsonPill").classList.toggle("checked", entry.fromJson !== false);
  document.getElementById("toJsonPill").classList.toggle("checked", entry.toJson !== false);
  document.getElementById("prefixPill").classList.toggle("checked", !!entry.usePrefix);
  jsonEditor.setValue(entry.json || "{}");
  generateDart();
  closeHistoryDialog();
  showToast("History loaded");
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  selectedHistoryId = null;
  hydrateHistory();
  showToast("History cleared");
}

function toPascalCase(str) {
  return str
    .replace(/[_-](.)/g, (_, c) => c.toUpperCase())
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function toCamelCase(str) {
  const pascal = toPascalCase(
    String(str)
      .replace(/[^a-zA-Z0-9_ -]/g, " ")
      .replace(/_/g, " ")
  );
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "value";
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function getPrefix() {
  const usePrefix = document.getElementById("usePrefixCheck").checked;
  const prefix = document.getElementById("prefixInput").value.trim();
  return usePrefix && prefix ? toPascalCase(prefix) : "";
}

function getClassName(name) {
  return getPrefix() + toPascalCase(name);
}

function getFieldName(name) {
  let fieldName = toCamelCase(name);
  if (/^\d/.test(fieldName)) {
    fieldName = `field${fieldName}`;
  }
  return fieldName || "value";
}

function getBaseName(key, isArrayItem) {
  let baseName = getClassName(key);
  if (isArrayItem) {
    baseName += "Item";
  }
  return baseName;
}

function getUniqueClassName(baseName, value, classes) {
  let className = baseName;
  let counter = 1;
  while (classes.has(className)) {
    const existing = classes.get(className);
    const existingKeys = Object.keys(existing || {})
      .sort()
      .join(",");
    const newKeys = Object.keys(value || {})
      .sort()
      .join(",");
    if (existingKeys === newKeys) {
      return className;
    }
    className = `${baseName}${counter}`;
    counter++;
  }
  return className;
}

// Infer Dart type string for a JSON value, collecting needed sub-classes
function inferType(key, value, classes, isArrayItem = false) {
  if (value === null || value === undefined) return "dynamic";
  if (typeof value === "string") return "String";
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number")
    return Number.isInteger(value) ? "int" : "double";
  if (Array.isArray(value)) {
    if (value.length === 0) return "List<dynamic>";
    const first = value[0];
    const inner = inferType(key, first, classes, true);
    return `List<${inner}>`;
  }
  if (typeof value === "object") {
    const baseName = getBaseName(key, isArrayItem);
    const className = getUniqueClassName(baseName, value, classes);
    // Schedule class generation if not already queued
    if (!classes.has(className)) {
      classes.set(className, value);
    }
    return className;
  }
  return "dynamic";
}

// Cast expression for fromJson
function castFromJson(key, value, classes) {
  if (value === null || value === undefined) return `json['${key}']`;
  if (typeof value === "string") return `json['${key}'] as String?`;
  if (typeof value === "boolean") return `json['${key}'] as bool?`;
  if (typeof value === "number") {
    const t = Number.isInteger(value) ? "int" : "double";
    return `json['${key}'] as ${t}?`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `json['${key}'] as List<dynamic>?`;
    const first = value[0];
    if (typeof first === "string") {
      return `(json['${key}'] as List<dynamic>?)?.map((e) => e as String).toList()`;
    }
    if (typeof first === "number") {
      const t = Number.isInteger(first) ? "int" : "double";
      return `(json['${key}'] as List<dynamic>?)?.map((e) => e as ${t}).toList()`;
    }
    if (typeof first === "boolean") {
      return `(json['${key}'] as List<dynamic>?)?.map((e) => e as bool).toList()`;
    }
    if (typeof first === "object" && first !== null && !Array.isArray(first)) {
      const baseName = getBaseName(key, true);
      const cn = getUniqueClassName(baseName, first, classes);
      return `(json['${key}'] as List<dynamic>?)\n        ?.map((e) => ${cn}.fromJson(e as Map<String, dynamic>))\n        .toList()`;
    }
    return `json['${key}'] as List<dynamic>?`;
  }
  if (typeof value === "object") {
    const baseName = getBaseName(key, false);
    const cn = getUniqueClassName(baseName, value, classes);
    return `json['${key}'] != null\n        ? ${cn}.fromJson(json['${key}'] as Map<String, dynamic>)\n        : null`;
  }
  return `json['${key}']`;
}

// Cast expression for toJson
function castToJson(key, value) {
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null
  ) {
    return `${key}?.map((e) => e.toJson()).toList()`;
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return `${key}?.toJson()`;
  }
  return key;
}

// Generate a single class block
function buildClass(
  className,
  obj,
  includeFromJson,
  includeToJson,
  classes
) {
  const keys = Object.keys(obj);
  const fieldMap = Object.fromEntries(keys.map((key) => [key, getFieldName(key)]));
  let out = `class ${className} {\n`;

  // Constructor
  out += `  ${className}({\n`;
  for (const key of keys) {
    out += `    this.${fieldMap[key]},\n`;
  }
  out += `  });\n`;

  // fromJson
  if (includeFromJson) {
    out += `\n  ${className}.fromJson(Map<String, dynamic> json) {\n`;
    for (const key of keys) {
      const cast = castFromJson(key, obj[key], classes);
      out += `    ${fieldMap[key]} = ${cast};\n`;
    }
    out += `  }\n`;
  }

  // Fields
  out += `\n`;
  for (const key of keys) {
    const type = inferType(key, obj[key], classes);
    out += `  ${type}? ${fieldMap[key]};\n`;
  }

  // toJson
  if (includeToJson) {
    out += `\n  Map<String, dynamic> toJson() {\n    return {\n`;
    for (const key of keys) {
      const val = castToJson(fieldMap[key], obj[key]);
      out += `      '${key}': ${val},\n`;
    }
    out += `    };\n  }\n`;
  }

  out += `}\n`;
  return out;
}

function generateDart() {
  if (!jsonEditor || !outputEditor) return;

  try {
    const json = JSON.parse(jsonEditor.getValue());
    const mainClassName = toPascalCase(
      document.getElementById("classNameInput").value.trim() || "RootModel"
    );
    const includeFromJson = document.getElementById("fromJsonCheck").checked;
    const includeToJson = document.getElementById("toJsonCheck").checked;

    // We use an ordered Map to track all classes to generate (BFS order)
    const classes = new Map();
    classes.set(mainClassName, json);

    let output = "";

    // Process queue — new entries get added inside buildClass via inferType/castFromJson
    const processed = new Set();
    const queue = [mainClassName];

    while (queue.length > 0) {
      const name = queue.shift();
      if (processed.has(name)) continue;
      processed.add(name);

      const obj = classes.get(name);
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) continue;

      const sizeBefore = classes.size;
      output +=
        buildClass(
          name,
          obj,
          includeFromJson,
          includeToJson,
          classes
        ) + "\n";

      // Enqueue any newly discovered classes
      for (const [k] of classes) {
        if (!processed.has(k)) queue.push(k);
      }
    }

    const code = output.trimEnd();
    outputEditor.setValue(code);
    document.getElementById("outputDot").classList.add("active");

    let fieldCount = 0;
    for (const name of processed) {
      const obj = classes.get(name);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        fieldCount += Object.keys(obj).length;
      }
    }

    setStatus("ok", `${mainClassName} generated`, {
      classes: processed.size,
      fields: fieldCount,
      lines: code ? code.split("\n").length : 0,
    });
    flashOutputPane();

    saveHistory();
  } catch (e) {
    outputEditor.setValue(`// Invalid JSON\n// ${e.message}`);
    document.getElementById("outputDot").classList.remove("active");
    setStatus("error", e.message, { classes: 0, fields: 0, lines: 0 });
  }
}

function copyGeneratedCode() {
  const val = outputEditor.getValue();
  if (!val) return;
  navigator.clipboard.writeText(val);
  showToast("Copied to clipboard");
}

function getDownloadClassName() {
  const input = document.getElementById("classNameInput");
  let className = input.value.trim();

  if (!className) {
    const promptedName = window.prompt("Enter a class name for the Dart file:");
    if (!promptedName) return null;
    className = toPascalCase(promptedName.trim());
    if (!className) return null;
    input.value = className;
    generateDart();
  }

  return toPascalCase(className);
}

function downloadGeneratedCode() {
  const className = getDownloadClassName();
  if (!className) return;

  if (!outputEditor.getValue().trim()) {
    generateDart();
  }

  const code = outputEditor.getValue().trim();
  if (!code || code.startsWith("// Invalid JSON")) {
    showToast("Generate valid Dart code first");
    return;
  }

  const fileName = `${toSnakeCase(className)}.dart`;
  const blob = new Blob([code], { type: "text/x-dart;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${fileName}`);
}
