import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { extractFromFiles } from 'i18n-extract';

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

const keys = extractFromFiles('src/**/*.js', {
  marker: '__',
  babelOptions: {
    ast: true,
    plugins: [
      '@babel/plugin-syntax-jsx',
      ['@babel/plugin-syntax-class-properties', { loose: true }],
      ['@babel/plugin-syntax-decorators', { legacy: true }],
    ],
  },
});
const strings = [...new Set(keys.map(e => e.key))].sort();

const newStrings = strings.filter(string => !oldStrings.has(string));
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

console.log(
  chalk.yellow.bold(`${obsoleteStrings.length} obsolete string(s):\n`)
);
obsoleteStrings.forEach(str => console.log(str));
console.log('\n');
console.log(chalk.yellow.bold(`${newStrings.length} new string(s):\n`));
newStrings.forEach(str => console.log(str));

Object.entries(newTrans).forEach(([locale, dict]) => {
  fs.writeFileSync(
    path.join(transDir, locale + '.json'),
    JSON.stringify(dict, null, 2)
  );
});
console.log(chalk.yellow.bold('\nTranslation files updated!'));

console.log(chalk.yellow.bold('Creating Crowdin file'));
const enDic = {};
strings.forEach(str => {
  enDic[str] = str;
});
fs.writeFileSync(
  path.join(transDir, 'en.json'),
  JSON.stringify(enDic, null, 2)
);

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
