import CodeMirror from "codemirror";
import throttle from "lodash.throttle";
import { defineSpellCheckerMode } from "./modes/spell-checker";
import { SuggestionDisplay } from './sugggestion-display';
import { MarkdownTokenAnalyzer } from './markdown-token-analyzer';
import { MarkdownPreview } from './markdown-preview';
import "codemirror/mode/markdown/markdown";

const markdownPreview = new MarkdownPreview();
const suggestionDisplay = new SuggestionDisplay();

document.body.appendChild(suggestionDisplay.getElement());

const spellChecker = defineSpellCheckerMode(new MarkdownTokenAnalyzer());

const codeEditor = CodeMirror(document.body, {
  mode: "markdown",
  spellcheck: true,
  lineNumbers: true,
});

const updateMarkdownPreview = throttle((data) => markdownPreview.updateData(data), 500);

const findSuggestions = throttle((codeEditor) => {
  const suggestions = spellChecker.getSuggestions(codeEditor, 3);
  if (suggestions.length > 0) {
    suggestionDisplay.addSuggestions(suggestions[0].suggestions);
  } else {
    suggestionDisplay.addSuggestions(["Нет предложений"]);
  }
}, 500);

document.body.appendChild(markdownPreview.build(codeEditor.getDoc().getValue()));

codeEditor.on("change", () => {
  updateMarkdownPreview(codeEditor.getDoc().getValue());
});

codeEditor.on("mousedown", findSuggestions);

codeEditor.on("keydown", (codeEditor, e) => {
  // right and left arrows
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    findSuggestions(codeEditor);
  }
});

codeEditor.addOverlay('spell-checker');
