import CodeMirror from "codemirror";
import throttle from "lodash.throttle";
import { defineSpellCheckerMode } from "./modes/spell-checker";
import { MarkdownTokenAnalyzer } from './markdown-token-analyzer';
import { MarkdownPreview } from './markdown-preview';
import "codemirror/mode/markdown/markdown";

defineSpellCheckerMode(new MarkdownTokenAnalyzer());

const codeEditor = CodeMirror(document.body, {
  mode: "markdown",
  spellcheck: true,
  lineNumbers: true,
});

const markdownPreview = new MarkdownPreview();

const updateMarkdownPreview = throttle((data) => markdownPreview.updateData(data), 500);

document.body.appendChild(markdownPreview.build(codeEditor.getDoc().getValue()));

codeEditor.on("change", () => {
  updateMarkdownPreview(codeEditor.getDoc().getValue());
});

codeEditor.addOverlay('spell-checker');
