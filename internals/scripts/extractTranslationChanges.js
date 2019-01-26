/**
 * Run this script to extract all new and updated strings from `app/languages/en.json`
 * (compared to `translations/en.json`) to `translations/[lang]-changes.json` files.
 * Translators can then translate these files, send back to us, then we can run
 * `update-translations` script to apply those changes into `app/languages/[lang].json` files
 */
const fs = require('fs');
const languages = ['de', 'es', 'fr', 'ja', 'ko', 'ru'];
const translationPath = lang => `./app/languages/${lang}.json`;
const changesPath = lang => `./translations/${lang}-changes.json`;
const oldEnPath = './translations/en.json';

const translations = languages.reduce(
  (obj, lang) => ({
    ...obj,
    [lang]: JSON.parse(fs.readFileSync(translationPath(lang))),
  }),
  {}
);
const changes = languages.reduce(
  (obj, lang) => ({
    ...obj,
    [lang]: {},
  }),
  {}
);

const en = JSON.parse(fs.readFileSync(translationPath('en')));
const enOld = fs.existsSync(oldEnPath)
  ? JSON.parse(fs.readFileSync(oldEnPath))
  : null;

Object.keys(en).forEach(id => {
  languages.forEach(lang => {
    // If the string wasn't translated or already translated but got updated
    if (!translations[lang][id] || (enOld && enOld[id] !== en[id])) {
      changes[lang][id] = en[id];
    }
  });
});

languages.forEach(lang => {
  fs.writeFileSync(changesPath(lang), JSON.stringify(changes[lang], null, 2));
});
