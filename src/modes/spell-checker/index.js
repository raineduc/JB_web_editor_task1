import CodeMirror from "codemirror";
import Typo from "typo-js";
import { readTextFromStream } from '../../utils/text-reader';

const heuristicAlphabetRegex = {
  "ru": /[а-яА-Я0-9-]/g,
  "en-US": /[\w-]/g,
};

export const defineSpellCheckerMode = (underlyingTokenAnalyzer) => {
  const dictionaries = [];

  const worker = new Worker(new URL('./create-typos.js', import.meta.url));

  loadEnUSDictionary(worker);
  loadRUDictionary(worker);

  let dictionariesLoaded = 0;

  worker.onmessage = e => {
    dictionariesLoaded += 1;

    const lightTypo = Object.create(Typo.prototype);

    const typeProxy = new Proxy(lightTypo, {
      get(target, prop, receiver) {
        if (typeof target[prop] !== 'function') {  
          return e.data[prop];
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, val, receiver) {
        if (typeof target[prop] !== 'function') {  
          e.data[prop] = val;
        } else {
          Reflect.set(target, prop, val, receiver);
        }
        return true;
      }
    });

    dictionaries.push(typeProxy);

    if (dictionariesLoaded == 2) {
      worker.terminate();
    }
  };

  CodeMirror.defineMode("spell-checker", (codeMirrorConfig, modeConfig) => {
    return {
      token(stream) {
        const baseToken = stream.baseToken();
        if (underlyingTokenAnalyzer.shouldTokenBeChecked(baseToken)) {
          const word = underlyingTokenAnalyzer.extractWordFromStream(stream);
          if (word.length) {
            advancePosition(stream, word.length);
            if (dictionaries.length > 0 && !spellWordWithKnownDictionaries(dictionaries, word)) {
              return "error";
            }
            return null;
          }
          stream.next();
          return null;
        }
        advancePosition(stream, baseToken.size);
        return null;
      },
    };
  });

  return {
    getSuggestions(codeEditor, max = 3) {
      const position = codeEditor.getDoc().getCursor();
      const token = codeEditor.getTokenAt(position);
      const words = underlyingTokenAnalyzer.extractWordsFromToken(token);
      const results = [];
      let startIndex = 0;
      for (let word of words) {
        const findIndex = token.string.indexOf(word, startIndex);
        const suggestions = suggestionWordWithKnownDictionaries(dictionaries, word);
        if (suggestions.length > 0) {  
          results.push({
            from: {
              line: position.line,
              ch: token.start + findIndex
            },
            to: {
              line: position.line,
              ch: token.start + findIndex + word.length - 1,
            },
            suggestions: suggestions.slice(0, max),
          });
        }
      }
      return results; 
    }
  }
};

/*
  Simple heuristics dictionary selection algorithm
  Similarity - coefficient between [0, 1], which is determined by the formula coef = n/N
  where n - count of alphabet regex matched letters
  N - length of incoming word 

  Check the word if its max coefficient greater than 0.5
*/    
const spellWordWithKnownDictionaries = (dictionaries, word) => {
  const { typo, maxSimilarity } = getMaxSimilarity(dictionaries, word);

  if (maxSimilarity > 0.5) {
    return typo.check(word);
  }

  return true;
}

const suggestionWordWithKnownDictionaries = (dictionaries, word) => {
  const { typo, maxSimilarity } = getMaxSimilarity(dictionaries, word);

  if (maxSimilarity > 0.5) {
    return typo.suggest(word);
  }
  return [];
}

const getMaxSimilarity = (dictionaries, word) => {
  let chosenTypo = null;
  let maxSimilarity = 0;
  if (word.length === 0) {
    return { typo: dictionaries[0], maxSimilarity: 0 };
  }  
  for (let typo of dictionaries) {
    const regex = heuristicAlphabetRegex[typo.dictionary];
    if (!regex) continue;
    const similarity = calcDictionaryMaxSimilarity(typo, word);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      chosenTypo = typo;
    }
  }
  return { typo: chosenTypo, maxSimilarity };
}

const calcDictionaryMaxSimilarity = (typo, word) => {
  const match = word.match(heuristicAlphabetRegex[typo.dictionary]);
  if (match === null) return 0;
  const letter_matches_count = match.reduce((acc, s) => acc + s.length, 0);
  return letter_matches_count / word.length;
}

const loadEnUSDictionary = async (worker) => {
  const aff_data = await (
    await fetch(
      "/dictionaries/en-US/index.aff"
    )
  ).text();
  const dic_data = await (
    await fetch(
      "/dictionaries/en-US/index.dic"
    )
  ).text();
  worker.postMessage(["en-US", aff_data, dic_data]);
};

const loadRUDictionary = async (worker) => {
  const aff_data = await readTextFromStream((
    await fetch(
      "/dictionaries/ru/index.aff"
    )
  ).body);
  const dic_data = await readTextFromStream((
    await fetch(
      "/dictionaries/ru/index.dic"
    )
  ).body);

  worker.postMessage(["ru", aff_data, dic_data]);
}

const advancePosition = (stream, n) => {
  for (let i = 0; i < n; i++) {
    if (stream.eol()) break;
    stream.next();
  }
}
