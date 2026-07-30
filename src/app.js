import * as editor from "./editor/index.js";
import { generateDartModels, toPascalCase, toSnakeCase } from "./generator/index.js";
import * as historyDialog from "./history/dialog.js";
import { saveEntry } from "./history/store.js";
import { flashOutputPane } from "./ui/motion.js";
import { setStatus } from "./ui/status.js";
import { showToast } from "./ui/toast.js";
import * as toolbar from "./ui/toolbar.js";

/**
 * Application actions. This is the only layer that coordinates across modules:
 * read options -> run the pure generator -> update editor, status, history,
 * motion. Nothing below this file knows about anything above it.
 */

const INVALID_MARKER = "// Invalid JSON";

export function generate() {
  if (!editor.isReady()) return;

  const options = toolbar.readOptions();

  let parsed;
  try {
    parsed = JSON.parse(editor.getInput());
  } catch (error) {
    editor.setOutput(`${INVALID_MARKER}\n// ${error.message}`);
    toolbar.setOutputHealthy(false);
    setStatus("error", error.message, { classes: 0, fields: 0, lines: 0 });
    return;
  }

  const result = generateDartModels({ json: parsed, ...options });

  editor.setOutput(result.code);
  toolbar.setOutputHealthy(true);

  setStatus("ok", `${result.rootClassName} generated`, {
    classes: result.classCount,
    fields: result.fieldCount,
    lines: result.lineCount,
  });
  flashOutputPane();

  saveEntry({
    className: options.className,
    json: editor.getInput(),
    fromJson: options.includeFromJson,
    toJson: options.includeToJson,
    usePrefix: options.prefix !== "",
    prefix: options.prefix,
  });
  historyDialog.refreshIfOpen();
}

/** Editing the payload makes the shown output stale. */
export function markOutputStale() {
  if (editor.getOutput().trim()) {
    setStatus("modified", "Payload changed — regenerate to update output");
  }
}

export async function copyOutput() {
  const code = editor.getOutput();
  if (!code) return;

  try {
    await navigator.clipboard.writeText(code);
    showToast("Copied to clipboard");
  } catch (_) {
    showToast("Could not access the clipboard");
  }
}

export function downloadOutput() {
  const className = resolveDownloadName();
  if (!className) return;

  if (!editor.getOutput().trim()) generate();

  const code = editor.getOutput().trim();
  if (!code || code.startsWith(INVALID_MARKER)) {
    showToast("Generate valid Dart code first");
    return;
  }

  const fileName = `${toSnakeCase(className)}.dart`;
  saveFile(fileName, code);
  showToast(`Downloaded ${fileName}`);
}

/** Downloads need a file name; ask for one if the Class field is empty. */
function resolveDownloadName() {
  const existing = toolbar.getClassName();
  if (existing) return toPascalCase(existing);

  const prompted = window.prompt("Enter a class name for the Dart file:");
  if (!prompted) return null;

  const className = toPascalCase(prompted.trim());
  if (!className) return null;

  toolbar.setClassName(className);
  generate();
  return className;
}

function saveFile(fileName, contents) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/x-dart;charset=utf-8" })
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Restore a history entry into the toolbar and editor, then regenerate. */
export function loadHistoryEntry(entry) {
  toolbar.applyOptions(entry);
  editor.setInput(entry.json || "{}");
  generate();
  showToast("History loaded");
}
