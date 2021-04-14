import Typo from 'typo-js';
import { heavyProps, TRANSMISSION_FINISHED, REGULAR_PROP } from './create-typos';

export class TypoLoader {
  constructor(openedWorker) {
    this.worker = openedWorker;
  }

  postDictionaryData(dictionary, affData, dicData) {
    this.worker.postMessage([dictionary, affData, dicData]);
    return new Promise((resolve) => {
      const typo = Object.create(Typo.prototype);

      const listener = e => {
        const { type, obj, array, prop, dictionary: receivedDictionary } = e.data;

        if (receivedDictionary === dictionary) {
          if (type === heavyProps.DICTIONARY_TABLE) {
            if (!typo[type]) typo[type] = {};
            for (let prop in obj) {
              typo[type][prop] = obj[prop];
            }
            return;  
          }

          if (type === heavyProps.REPLACEMENT_TABLE) {
            if (!typo[type]) typo[type] = [];
            typo[type].push.apply(typo[type], array);
          }

          if (type === TRANSMISSION_FINISHED) {
            this.worker.removeEventListener('message', listener);
            return resolve(typo);
          }
          typo[prop] = obj;
        }
      };

      this.worker.addEventListener('message', listener);
    });
  }

  closeWorker() {
    this.worker.terminate();
  }
}