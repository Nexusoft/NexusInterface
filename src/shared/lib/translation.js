import fs from 'fs';
import path from 'path';
import { i18nConfig } from 'es2015-i18n-tag';
import { assetsDir } from 'consts/paths';

export function initializeTranslation(locale) {
  const languages = ['de', 'es', 'fr', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru'];
  locale = languages.includes(locale) ? locale : 'en';
  const translations =
    locale === 'en'
      ? null
      : JSON.parse(
          fs.readFileSync(path.join(assetsDir, 'languages', `${locale}.json`))
        );

  i18nConfig({
    locales: locale,
    translations,
  });
}
