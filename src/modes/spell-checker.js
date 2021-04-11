import CodeMirror from "codemirror";
import Typo from "typo-js";

export const defineSpellCheckerMode = (underlyingTokenAnalyzer) => {
  let isDictionaryLoaded = false;
  let typoObject = null;

  loadENDictionary().then((typo) => {
    isDictionaryLoaded = true;
    typoObject = typo;
  });

  const wordsInCurrentMDToken = {
    token: null,
    symbolsLeft: 0,
  };

  CodeMirror.defineMode("spell-checker", (codeMirrorConfig, modeConfig) => {
    return {
      token(stream) {
        const baseToken = stream.baseToken();
        if (underlyingTokenAnalyzer.shouldTokenBeChecked(baseToken)) {
          const word = underlyingTokenAnalyzer.extractWordFromStream(stream);
          if (word.length) {
            advancePosition(stream, word.length);
            return null;
          }
        }
        stream.next();
      },
    };
  });
};

const loadENDictionary = async () => {
  const aff_data = await (
    await fetch(
      "https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.aff"
    )
  ).text();
  const dic_data = await (
    await fetch(
      "https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.dic"
    )
  ).text();
  return new Typo("en_US", aff_data, dic_data);
};

const advancePosition = (stream, n) => {
  for (let i = 0; i < n; i++) {
    if (stream.eol()) break;
    stream.next();
  }
}
