/**
 * Convert translations from old json format to the new csv format supporting context
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import csvStringify from 'csv-stringify';
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
  'ru',
  'zh-cn',
];

/**
 * Load old strings
 * =============================================================================
 */
const oldDicts = {};
locales.forEach((locale) => {
  const json = fs.readFileSync(path.join(transDir, locale + '.json'));
  oldDicts[locale] = JSON.parse(json);
});

/**
 * Extract new strings
 * =============================================================================
 */
const keys = extractFromFiles('src/**/*.js', {
  marker: '__',
});
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

const newDicts = { en: newEnDict };
Object.entries(oldDicts).forEach(([locale, oldDict]) => {
  if (locale === 'en') return;
  const newDict = {};
  Object.entries(newEnDict).forEach(([context, newStrings]) => {
    Object.keys(newStrings).forEach((newString) => {
      if (!newDict[context]) {
        newDict[context] = {};
      }
      newDict[context][newString] = oldDict[newString] || null;
    });
  });
  newDicts[locale] = newDict;
});

/**
 * Write changes to files
 * =============================================================================
 */

Object.entries(newDicts).forEach(([locale, newDict]) => {
  const lines = [];
  Object.entries(newDict).forEach(([context, newStrings]) => {
    Object.entries(newStrings).forEach(([keyString, translation]) => {
      lines.push([keyString, translation, context]);
    });
  });
  csvStringify(lines, (err, output) => {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(path.join(transDir, locale + '.csv'), output);
    }
  });
  console.log(chalk.yellow.bold('Translation files updated:', locale));
});
