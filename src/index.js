import CodeMirror from "codemirror";
import { defineSpellCheckerMode } from "./modes/spell-checker";
import { MarkdownTokenAnalyzer } from './markdown-token-analyzer';
import "codemirror/mode/markdown/markdown";

defineSpellCheckerMode(new MarkdownTokenAnalyzer());

const codeEditor = CodeMirror(document.body, {
  mode: "markdown",
  spellcheck: true,
  lineNumbers: true,
});

let editorContentChanged = false;
let isOverlayOn = false;

codeEditor.on("change", (codeMirror, { from, to, text, removed, origin }) => {
  editorContentChanged = true;
  if (text.some(s => s.search(/\s/) !== -1 || s === "")) {
    if (isOverlayOn) return;
    isOverlayOn = true;
    codeEditor.addOverlay('spell-checker');
    return;
  }
  isOverlayOn = false;
  codeEditor.removeOverlay('spell-checker');
});

codeEditor.on("beforeSelectionChange", (codeMirror, { ranges, origin, update }) => {
  editorContentChanged = false;
  setTimeout(() => {
    if (!editorContentChanged && !isOverlayOn) {
      isOverlayOn = true;
      codeEditor.addOverlay('spell-checker');
    }
  }, 0);
})

codeEditor.addOverlay('spell-checker');
