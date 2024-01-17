import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { stringify } from 'csv-stringify';
import { parse } from 'csv-parse/sync';
import extractFromFiles from './i18nExtract';

const transDir = path.join(__dirname, '../../assets/translations');

const locales = [
  'en',
  'ar',
  'de',
  'es',
  'fi',
  'fr',
  'ja',
  'hu',
  'ko',
  'no',
  'nl',
  'pl',
  'pt',
  'ro',
  'sr',
  'ru',
  'zh-cn',
];

/**
 * Load old strings
 * =============================================================================
 */
const oldDicts = {};
locales.forEach((locale) => {
  const oldDict = {};
  const csv = fs.readFileSync(path.join(transDir, locale + '.csv'));
  const records = parse(csv);
  records.forEach(([key, translation, context]) => {
    if (!oldDict[context]) {
      oldDict[context] = {};
    }
    oldDict[context][key] = translation;
  });
  oldDicts[locale] = oldDict;
});
const oldEnDict = oldDicts['en'];

/**
 * Extract new strings
 * =============================================================================
 */
const keys = extractFromFiles('src/**/*.js');
const newEnDict = {};
keys.forEach(({ key, context }) => {
  if (!newEnDict[context]) {
    newEnDict[context] = {};
  }
  newEnDict[context][key] = key;
});

/**
 * Calculate diff
 * =============================================================================
 */
const newTranslations = [];
Object.entries(newEnDict).forEach(([context, strings]) => {
  Object.keys(strings).forEach((string) => {
    if (!oldEnDict[context] || !oldEnDict[context][string]) {
      newTranslations.push([context, string]);
    }
  });
});

const obsoleteTranslations = [];
Object.entries(oldEnDict).forEach(([context, oldStrings]) => {
  Object.keys(oldStrings).forEach((oldString) => {
    if (!newEnDict[context] || !newEnDict[context][oldString]) {
      obsoleteTranslations.push([context, oldString]);
    }
  });
});

const newDicts = { en: newEnDict };
Object.entries(oldDicts).forEach(([locale, oldDict]) => {
  if (locale === 'en') return;
  const newDict = {};
  Object.entries(newEnDict).forEach(([context, newStrings]) => {
    Object.keys(newStrings).forEach((newString) => {
      if (!newDict[context]) {
        newDict[context] = {};
      }
      newDict[context][newString] =
        (oldDict[context] && oldDict[context][newString]) || null;
    });
  });
  newDicts[locale] = newDict;
});

/**
 * Report to console
 * =============================================================================
 */
console.log(
  chalk.yellow.bold(`${obsoleteTranslations.length} obsolete string(s):\n`)
);
obsoleteTranslations.forEach(([context, string]) =>
  console.log(`[${context}] ${string}`)
);
console.log('\n');
console.log(chalk.yellow.bold(`${newTranslations.length} new string(s):\n`));
newTranslations.forEach(([context, string]) =>
  console.log(`[${context}] ${string}`)
);

/**
 * Write changes to files
 * =============================================================================
 */
// Object.entries(newDicts).forEach(([locale, newDict]) => {
//   fs.writeFileSync(
//     path.join(transDir, locale + '.json'),
//     JSON.stringify(newDict, null, 2)
//   );
// });

Object.entries(newDicts).forEach(([locale, newDict]) => {
  const lines = [];
  Object.entries(newDict).forEach(([context, newStrings]) => {
    Object.entries(newStrings).forEach(([keyString, translation]) => {
      lines.push([keyString, translation, context]);
    });
  });
  stringify(lines, (err, output) => {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(path.join(transDir, locale + '.csv'), output);
    }
  });
});

console.log(chalk.yellow.bold('\nTranslation files updated!'));
