import Typo from "typo-js";

export const TRANSMISSION_FINISHED = 'finished';
export const REGULAR_PROP = 'regular';
export const heavyProps = {
  DICTIONARY_TABLE: 'dictionaryTable',
  REPLACEMENT_TABLE: 'replacementTable',
};

onmessage = (e) => {
  const [dictionary, affData, dicData] = e.data;

  const typo = new Typo(dictionary, affData, dicData);

  for (let prop in typo) {
    if (prop === heavyProps.DICTIONARY_TABLE) {
      transferProps(dictionary, heavyProps.DICTIONARY_TABLE, typo[prop], 2000);
      continue;
    }
    
    if (prop == heavyProps.REPLACEMENT_TABLE) {
      transferArray(dictionary, heavyProps.REPLACEMENT_TABLE, typo[prop], 100);
      continue;
    }

    if (typeof typo[prop] !== 'function') {
      postMessage({
        type: REGULAR_PROP,
        dictionary,
        prop,
        obj: typo[prop],
      });
    }
  }
  postMessage({
    type: TRANSMISSION_FINISHED,
    dictionary,
  });
}

const transferArray = (dictionary, type, arr, numberOfElements) => {
  let n = 0;
  if (arr.length === 0) {
    postMessage({
      type,
      dictionary,
      array: [],
    });
    return;
  }
  while (n < arr.length) {
    postMessage({
      type,
      dictionary,
      array: arr.slice(n, n + numberOfElements),
    });
    n += numberOfElements;
  }
}

const transferProps = (dictionary, type, obj, numberOfProps) => {
  let n = 0;
  let transferableObj = {};
  const propsLength = Object.keys(obj).length;
  for (let prop in obj) {
    if (n == numberOfProps) {
      postMessage({
        type,
        dictionary,
        obj: transferableObj,
      });
      n = 0;
      transferableObj = {};
    }
    transferableObj[prop] = obj[prop];
    n += 1;
  }
  if (n > 0 || propsLength === 0) {
    postMessage({
      type,
      dictionary,
      obj: transferableObj,
    });
  }
}