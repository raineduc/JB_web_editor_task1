const markdownTypes = {
  header: "header",
  code: "comment",
  quote: "quote",
  list1: "variable-2",
  list2: "variable-3",
  list3: "keyword",
  hr: "hr",
  image: "image",
  imageAltText: "image-alt-text",
  imageMarker: "image-marker",
  formatting: "formatting",
  linkInline: "link",
  linkEmail: "link",
  linkText: "link",
  linkHref: "string",
  em: "em",
  strong: "strong",
  strikethrough: "strikethrough",
  emoji: "builtin",
};

const { header, code, list1, list2, list3, imageAltText, linkText, em, strong } = markdownTypes;

const regex = `${header}|${code}|${list1}}|${list2}|${list3}|${imageAltText}|${linkText}|${em}|${strong}`;


const wordBoundary = "#!\\[\\]*_\\\\<>` (~:";
const wordRegex = new RegExp(`^[^${wordBoundary}]+`);
const wordFromTokenRegex = new RegExp(`[^${wordBoundary}]+`, 'g');

const checkedTypesRegex = new RegExp(regex);

export class MarkdownTokenAnalyzer {
  constructor(props) {
    this.regex = regex;
    this.wordBoundaryRegex = wordRegex;
  }
  
  shouldTokenBeChecked(token) {
    const { type, size } = token;
    return type === null || type.search(checkedTypesRegex) !== -1;
  }

  extractWordFromStream(stream) {
    const matched = stream.match(wordRegex, false);
    return matched ? matched[0] : "";
  }

  extractWordsFromToken(token) {
    const result = token.string.match(wordFromTokenRegex);
    return result ? result : [];
  }
}