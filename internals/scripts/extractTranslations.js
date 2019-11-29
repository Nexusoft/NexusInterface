import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import extractFromFiles from './i18nExtract';

const transDir = path.join(__dirname, '../../assets/translations');

const locales = [
  'ar',
  'de',
  'es',
  'fi',
  'fr',
  'ja',
  'hu',
  'ko',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'zh-cn',
];

/**
 * Load old strings
 */
const oldTrans = {};
locales.forEach(locale => {
  oldTrans[locale] = JSON.parse(
    fs.readFileSync(path.join(transDir, locale + '.json'))
  );
});
const oldStrings = new Set();
Object.values(oldTrans).forEach(translations =>
  Object.keys(translations).forEach(str => oldStrings.add(str))
);

/**
 * Extract new strings
 */
const keys = extractFromFiles('src/**/*.js', {
  marker: '__',
});
const enDic = {};
keys.forEach(({ key, context }) => {
  enDic[context][key] = key;
});
// const strings = [...new Set(keys.map(e => e.key))].sort();
// const newStrings = strings.filter(string => !oldStrings.has(string));

/**
 * Calculate diff
 */
const obsoleteStrings = [...oldStrings].filter(
  string => !strings.includes(string)
);
const newTrans = {};
Object.entries(oldTrans).forEach(([locale, dict]) => {
  const newDict = {};
  strings.forEach(str => {
    newDict[str] = dict[str] || null;
  });
  newTrans[locale] = newDict;
});

/**
 * Report on console
 */
console.log(
  chalk.yellow.bold(`${obsoleteStrings.length} obsolete string(s):\n`)
);
obsoleteStrings.forEach(str => console.log(str));
console.log('\n');
console.log(chalk.yellow.bold(`${newStrings.length} new string(s):\n`));
newStrings.forEach(str => console.log(str));

/**
 * Write changes to files
 */
Object.entries(newTrans).forEach(([locale, dict]) => {
  fs.writeFileSync(
    path.join(transDir, locale + '.json'),
    JSON.stringify(dict, null, 2)
  );
});
const enDic = {};
strings.forEach(str => {
  enDic[str] = str;
});
fs.writeFileSync(
  path.join(transDir, 'en.json'),
  JSON.stringify(enDic, null, 2)
);
console.log(chalk.yellow.bold('\nTranslation files updated!'));

console.log(chalk.yellow.bold('Creating Crowdin file'));
var result = Object.keys(enDic).map(function(key) {
  return [key, enDic[key]];
});

var lineArray = [];
result.forEach(function(infoArray, index) {
  var line = '"' + infoArray[0] + '","' + infoArray[1] + '"';
  lineArray.push(line);
});
var csvContent = lineArray.join('\n');
fs.writeFileSync(path.join(transDir, 'en.csv'), csvContent);

console.log(chalk.yellow.bold('Finished Crowdin file'));
