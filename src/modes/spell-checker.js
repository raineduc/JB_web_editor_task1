import CodeMirror from "codemirror";
import Typo from "typo-js";

const heuristicAlphabetRegex = {
  "ru": /[а-яА-Я0-9-]/g,
  "en-US": /[\w-]/g,
};

export const defineSpellCheckerMode = (underlyingTokenAnalyzer) => {
  const dictionaries = [];

  loadEnUSDictionary().then((typo) => {
    dictionaries.push(typo);
    dictionaries[typo.dictionary] = typo;
  });

  loadRUDictionary().then((typo) => {
    dictionaries.push(typo);
  });


  console.log("au");

  CodeMirror.defineMode("spell-checker", (codeMirrorConfig, modeConfig) => {
    return {
      token(stream) {
        const baseToken = stream.baseToken();
        if (underlyingTokenAnalyzer.shouldTokenBeChecked(baseToken)) {
          const word = underlyingTokenAnalyzer.extractWordFromStream(stream);
          if (word.length) {
            advancePosition(stream, word.length);
            if (dictionaries.length && !wordSpellWithKnownDictionaries(dictionaries, word)) {
              return "error";
            }
            return null;
          }
        }
        stream.next();
      },
    };
  });
};

/*
  Simple heuristics dictionary selection algorithm
  Similarity - coefficient between [0, 1], which is determined by the formula coef = n/N
  where n - count of alphabet regex matched letters
  N - length of incoming word 

  Check the word if its max coefficient greater than 0.5
*/    
const wordSpellWithKnownDictionaries = (dictionaries, word) => {
  let chosenTypo = null;
  let maxSimilarity = 0;
  for (let typo of dictionaries) {
    const regex = heuristicAlphabetRegex[typo.dictionary];
    if (!regex) continue;
    const similarity = calcDictionarySimilarity(typo, word);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      chosenTypo = typo;
    }
  }

  if (maxSimilarity > 0.5) {
    return chosenTypo.check(word);
  }

  return true;
}

const calcDictionarySimilarity = (typo, word) => {
  const match = word.match(heuristicAlphabetRegex[typo.dictionary]);
  if (match === null) return 0;
  const letter_matches_count = match.reduce((acc, s) => acc + s.length, 0);
  return letter_matches_count / word.length;
}

const loadEnUSDictionary = async () => {
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
  return new Typo("en-US", aff_data, dic_data);
};

const loadRUDictionary = async () => {
  const aff_data = await (
    await fetch(
      "/dictionaries/ru/index.aff"
    )
  ).text();
  const dic_data = await (
    await fetch(
      "/dictionaries/ru/index.dic"
    )
  ).text();
  return new Typo("ru", aff_data, dic_data);
}

const advancePosition = (stream, n) => {
  for (let i = 0; i < n; i++) {
    if (stream.eol()) break;
    stream.next();
  }
}
