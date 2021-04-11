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

codeEditor.addOverlay('spell-checker');
