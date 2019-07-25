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
const engTranslate = (string, data) =>
  Polyglot.transformPhrase(string, data, 'en');

const polyglot = new Polyglot({
  locale,
  phrases,
  allowMissing: true,
  onMissingKey: engTranslate,
});

const translate =
  locale === 'en' ? engTranslate : (string, data) => polyglot.t(string, data);

export { translate };
