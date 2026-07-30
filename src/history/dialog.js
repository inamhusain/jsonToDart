import { DEFAULT_CLASS_NAME } from "../config.js";
import { byId, on } from "../dom.js";
import { closeDialog, isDialogOpen, openDialog } from "../ui/dialog.js";
import { clearHistory, findEntry, readHistory } from "./store.js";

const DIALOG_ID = "historyDialog";
const PREVIEW_LIMIT = 700;
const SNIPPET_LIMIT = 110;

/**
 * The recent-history dialog: a list on the left, a preview on the right.
 *
 * Tiles are built with createElement and textContent, never innerHTML — the
 * entries contain user-supplied JSON and class names, which would otherwise be
 * parsed as markup.
 */

let selectedId = null;
let onLoadEntry = () => {};

export function initHistoryDialog({ onLoad }) {
  onLoadEntry = onLoad;

  on(byId("historyOpenBtn"), "click", open);
  on(byId("historyLoadBtn"), "click", loadSelected);
  on(byId("historyClearBtn"), "click", () => {
    clearHistory();
    selectedId = null;
    render();
  });

  render();
}

export function open() {
  selectedId = null;
  render();
  openDialog(DIALOG_ID);
}

/** Re-render only if the dialog is actually on screen. */
export function refreshIfOpen() {
  if (isDialogOpen(DIALOG_ID)) render();
}

function select(id) {
  selectedId = String(id);
  render();
}

function loadSelected() {
  const entry = selectedId ? findEntry(selectedId) : null;
  if (!entry) return;

  closeDialog(DIALOG_ID);
  onLoadEntry(entry);
}

function previewText(entry) {
  if (!entry) return "No history selected.";
  try {
    return JSON.stringify(JSON.parse(entry.json || "{}"), null, 2).slice(0, PREVIEW_LIMIT);
  } catch (_) {
    return (entry.json || "").slice(0, PREVIEW_LIMIT);
  }
}

function buildTile(entry, isActive) {
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = `history-tile${isActive ? " active" : ""}`;
  tile.addEventListener("click", () => select(entry.id));

  const title = document.createElement("span");
  title.className = "history-tile-title";
  title.textContent = entry.className || DEFAULT_CLASS_NAME;

  const meta = document.createElement("span");
  meta.className = "history-tile-meta";
  meta.textContent = new Date(entry.savedAt).toLocaleString();

  const snippet = document.createElement("span");
  snippet.className = "history-tile-snippet";
  snippet.textContent = (entry.json || "").replace(/\s+/g, " ").slice(0, SNIPPET_LIMIT);

  tile.append(title, meta, snippet);
  return tile;
}

function renderEmpty(list, preview, meta, loadBtn) {
  const empty = document.createElement("div");
  empty.className = "history-empty";
  empty.textContent = "No local history yet. Generate something once and it will appear here.";
  list.replaceChildren(empty);

  preview.textContent = "No history selected.";
  meta.textContent = "Select a history item";
  loadBtn.disabled = true;
}

export function render() {
  const list = byId("historyList");
  const preview = byId("historyPreviewContent");
  const meta = byId("historyPreviewMeta");
  const loadBtn = byId("historyLoadBtn");
  if (!list || !preview || !meta || !loadBtn) return;

  const entries = readHistory();

  if (entries.length === 0) {
    selectedId = null;
    renderEmpty(list, preview, meta, loadBtn);
    return;
  }

  // Default to the newest entry, and recover if the selection disappeared.
  const stillPresent = entries.some((entry) => String(entry.id) === selectedId);
  if (!selectedId || !stillPresent) selectedId = String(entries[0].id);

  list.replaceChildren(
    ...entries.map((entry) => buildTile(entry, String(entry.id) === selectedId))
  );

  const selected = entries.find((entry) => String(entry.id) === selectedId) ?? null;
  preview.textContent = previewText(selected);
  meta.textContent = selected
    ? `${selected.className || DEFAULT_CLASS_NAME} • ${new Date(selected.savedAt).toLocaleString()}`
    : "Select a history item";
  loadBtn.disabled = !selected;
}
