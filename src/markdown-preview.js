import showdown from "showdown";
import DOMPurify from "dompurify";

export class MarkdownPreview {
  constructor() {
    this.element = document.createElement('div');
    this.converter = new showdown.Converter();
  }

  build(initialData) {
    const input = this.converter.makeHtml(initialData);
    this.element.innerHTML = DOMPurify.sanitize(input);
    return this.element; 
  }

  updateData(markdown) {
    const input = this.converter.makeHtml(markdown);
    this.element.innerHTML = DOMPurify.sanitize(input);
  }
}