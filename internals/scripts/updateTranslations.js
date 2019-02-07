/**
 * Run this script to update the changes from `translations/[lang]-changes.json` files
 * to the corresponding `app/languages/[lang].json` files.
 */
const fs = require('fs');
const languages = ['de', 'es', 'fr', 'ja', 'ko', 'ru'];
const translationPath = lang => `./app/languages/${lang}.json`;
const changesPath = lang => `./translations/${lang}-changes.json`;

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
    [lang]: JSON.parse(fs.readFileSync(changesPath(lang))),
  }),
  {}
);
const newTranslations = languages.reduce(
  (obj, lang) => ({
    ...obj,
    [lang]: {},
  }),
  {}
);

const en = JSON.parse(fs.readFileSync(translationPath('en')));

Object.keys(en).forEach(id => {
  languages.forEach(lang => {
    newTranslations[lang][id] =
      changes[lang][id] || translations[lang][id] || null;
  });
});

languages.forEach(lang => {
  fs.writeFileSync(
    translationPath(lang),
    JSON.stringify(newTranslations[lang], null, 2)
  );
});
