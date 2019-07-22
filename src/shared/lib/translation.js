import fs from 'fs';
import path from 'path';
import Polyglot from 'node-polyglot';

import { assetsDir } from 'consts/paths';

let polyglot;

export function initializeTranslation(locale) {
  const languages = ['de', 'es', 'fr', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru'];
  locale = languages.includes(locale) ? locale : 'en';
  const phrases =
    locale === 'en'
      ? null
      : JSON.parse(
          fs.readFileSync(path.join(assetsDir, 'languages', `${locale}.json`))
        );

  polyglot = new Polyglot({
    locale,
    phrases,
  });
}

export function translate(...args) {
  return polyglot.t(...args);
}

// function joinKey(strings) {
//   let key = '';
//   strings.forEach((str, i) => {
//     key += str + `{{${i + 1}}}`;
//   });
//   return key;
// }

// export function translate(strings, ...values) {
//   const key = values.length ? joinKey(strings) : strings[0];
//   const params = values.length
//     ? values.reduce((obj, value, i) => ({ ...obj, [String(i)]: value }), {})
//     : undefined;
//   return polyglot.t(key, params);
// }
