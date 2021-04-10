import CodeMirror from "codemirror";
import "codemirror/mode/markdown/markdown";

const codeEditor = CodeMirror(document.body, {
  mode: "markdown",
  lineNumbers: true,
});

