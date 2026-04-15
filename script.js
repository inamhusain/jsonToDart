let jsonEditor, outputEditor;
let currentStyle = 'manual';

require.config({
  paths: { vs: "https://unpkg.com/monaco-editor@0.52.2/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  const darkTheme = {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "4a5568" },
      { token: "keyword", foreground: "54b3f5" },
      { token: "string", foreground: "a8d8a8" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "c084fc" },
    ],
    colors: {
      "editor.background": "#0a0e1a",
      "editor.foreground": "#e2e8f0",
      "editorLineNumber.foreground": "#2d3748",
      "editorLineNumber.activeForeground": "#64748b",
      "editor.selectionBackground": "#1d4ed840",
      "editor.lineHighlightBackground": "#111827",
      "editorCursor.foreground": "#54b3f5",
      "editorIndentGuide.background": "#1e2a3a",
      "editorGutter.background": "#0a0e1a",
      "scrollbarSlider.background": "#1e2a3a",
      "scrollbarSlider.hoverBackground": "#2d3748",
    },
  };

  monaco.editor.defineTheme("flutterDark", darkTheme);

  const sharedOpts = {
    theme: "flutterDark",
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
});

function setStyle(style) {
  currentStyle = style;
  document
    .getElementById("manualBtn")
    .classList.toggle("active", style === "manual");
  document
    .getElementById("factoryBtn")
    .classList.toggle("active", style === "factory");
  generateDart();
}

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
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function toPascalCase(str) {
  return str
    .replace(/[_-](.)/g, (_, c) => c.toUpperCase())
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
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
  isFactory,
  includeFromJson,
  includeToJson,
  classes
) {
  const keys = Object.keys(obj);
  let out = `class ${className} {\n`;

  // Constructor
  out += `  ${className}({\n`;
  for (const key of keys) {
    out += `    this.${key},\n`;
  }
  out += `  });\n`;

  // fromJson
  if (includeFromJson) {
    if (isFactory) {
      out += `\n  factory ${className}.fromJson(Map<String, dynamic> json) => ${className}(\n`;
      for (const key of keys) {
        const cast = castFromJson(key, obj[key], classes);
        out += `    ${key}: ${cast},\n`;
      }
      out += `  );\n`;
    } else {
      out += `\n  ${className}.fromJson(Map<String, dynamic> json) {\n`;
      for (const key of keys) {
        const cast = castFromJson(key, obj[key], classes);
        out += `    ${key} = ${cast};\n`;
      }
      out += `  }\n`;
    }
  }

  // Fields
  out += `\n`;
  for (const key of keys) {
    const type = inferType(key, obj[key], classes);
    out += `  ${type}? ${key};\n`;
  }

  // toJson
  if (includeToJson) {
    out += `\n  Map<String, dynamic> toJson() {\n    return {\n`;
    for (const key of keys) {
      const val = castToJson(key, obj[key]);
      out += `      '${key}': ${val},\n`;
    }
    out += `    };\n  }\n`;
  }

  out += `}\n`;
  return out;
}

function generateDart() {
  try {
    const json = JSON.parse(jsonEditor.getValue());
    const mainClassName = toPascalCase(
      document.getElementById("classNameInput").value.trim() || "RootModel"
    );
    const isFactory = currentStyle === "factory";
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
          isFactory,
          includeFromJson,
          includeToJson,
          classes
        ) + "\n";

      // Enqueue any newly discovered classes
      for (const [k] of classes) {
        if (!processed.has(k)) queue.push(k);
      }
    }

    outputEditor.setValue(output.trimEnd());
    document.getElementById("outputDot").classList.add("active");
  } catch (e) {
    outputEditor.setValue(`// Invalid JSON\n// ${e.message}`);
    document.getElementById("outputDot").classList.remove("active");
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
