import * as app from "./app.js";
import { byId, on } from "./dom.js";
import * as editor from "./editor/index.js";
import * as historyDialog from "./history/dialog.js";
import * as theme from "./theme.js";
import { closeAllDialogs, initDialogs } from "./ui/dialog.js";
import { initInfoDialog } from "./ui/info-dialog.js";
import { initPointerParallax } from "./ui/motion.js";
import { setStatus } from "./ui/status.js";
import * as toolbar from "./ui/toolbar.js";

/**
 * Entry point: bootstrap modules and wire the DOM to app actions.
 *
 * All event wiring lives here or in the widget modules — there are no inline
 * onclick attributes in index.html, so nothing has to be exposed on window.
 */

function wireToolbar() {
  toolbar.initToolbar({ onChange: app.generate });
  toolbar.labelShortcut();

  on(byId("generateBtn"), "click", app.generate);
  on(byId("copyBtn"), "click", app.copyOutput);
  on(byId("downloadBtn"), "click", app.downloadOutput);
}

function wireTheme() {
  on(byId("themeToggle"), "click", theme.toggleTheme);
  theme.onChange((next) => editor.setTheme(next));
  theme.watchSystemTheme();
}

function wireKeyboard() {
  on(document, "keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      app.generate();
      return;
    }
    if (event.key === "Escape") closeAllDialogs();
  });
}

function showVersion() {
  const chip = byId("versionChip");
  if (chip) chip.textContent = window.APP_VERSION || "";
}

async function start() {
  showVersion();
  wireTheme();
  wireToolbar();
  wireKeyboard();

  initDialogs();
  initInfoDialog();
  historyDialog.initHistoryDialog({ onLoad: app.loadHistoryEntry });
  initPointerParallax();

  try {
    await editor.initEditors({
      theme: theme.currentTheme(),
      onInputChange: app.markOutputStale,
      onRun: app.generate,
    });
    setStatus("ready", "Paste JSON, then generate");
  } catch (error) {
    setStatus("error", "Could not load the code editor — check your connection");
    console.error(error);
  }
}

start();
