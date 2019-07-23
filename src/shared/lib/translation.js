import fs from 'fs';
import path from 'path';
import Polyglot from 'node-polyglot';

import { assetsDir } from 'consts/paths';
import { LoadSettings } from 'lib/settings';

const locales = ['de', 'es', 'fr', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru'];
const { locale: loc } = LoadSettings();
const locale = locales.includes(loc) ? loc : 'en';
const phrases =
  locale === 'en'
    ? null
    : JSON.parse(
        fs.readFileSync(path.join(assetsDir, 'translations', `${locale}.json`))
      );

const polyglot = new Polyglot({
  locale,
  phrases,
});

const translate =
  locale === 'en'
    ? (string, data) => Polyglot.transformPhrase(string, data, 'en')
    : (string, data) => polyglot.t(string, { _: string, ...data });

export { translate };

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
