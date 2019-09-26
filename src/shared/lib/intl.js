import React from 'react';
import fs from 'fs';
import path from 'path';
import Polyglot from 'node-polyglot';

import { assetsDir } from 'consts/paths';
import settings from 'data/initialSettings';
import { escapeRegExp } from 'utils/misc';

const locales = [
  'ar',
  'de',
  'es',
  'fi',
  'fr',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt',
  'ru',
  'zh-cn',
];
const locale = locales.includes(settings.locale) ? settings.locale : 'en';
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

const rawTranslate =
  locale === 'en' ? engTranslate : (string, data) => polyglot.t(string, data);

function inject(string, injections) {
  if (injections) {
    // Process from the first match in the string
    let firstMatch = null;
    for (let key in injections) {
      const escaped = escapeRegExp(String(key));
      const regex = new RegExp(`<${escaped}>(.*?)<\/${escaped}>`, 'm');
      const match = string.match(regex);
      if (match && (!firstMatch || match.index < firstMatch.index)) {
        firstMatch = { ...match, key };
      }
    }
    if (firstMatch) {
      const before = string.slice(0, firstMatch.index);
      const after = string.slice(firstMatch.index + firstMatch[0].length);
      const inner = inject(firstMatch[1], injections);
      const injection = injections[firstMatch.key];
      const replacement =
        typeof injection === 'function'
          ? injection(inner)
          : injection
          ? inner
          : '';
      return (
        <>
          {before}
          {replacement}
          {inject(after, injections)}
        </>
      );
    }
  }
  return string;
}

const translate = (string, data, injections) =>
  inject(rawTranslate(string, data), injections);

const ensureSignificantDigit = (decimalDigits, num) => {
  let digits = Number(decimalDigits) || 0;
  if (num && typeof num === 'number') {
    let threshold = 10 ** -digits;
    num = Math.abs(num);
    while (num < threshold) {
      threshold /= 10;
      ++digits;
    }
  }
  return digits;
};

export { translate };

export const formatNumber = (num, maxDecimalDigits = 3) => {
  const digits = ensureSignificantDigit(maxDecimalDigits, num);
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
  }).format(num);
};

export const formatCurrency = (num, currency = 'USD', maxDecimalDigits = 3) => {
  const digits = ensureSignificantDigit(maxDecimalDigits, num);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: digits,
  }).format(num);
};

export const formatPercent = (num, maxDecimalDigits) => {
  const digits = ensureSignificantDigit(maxDecimalDigits, num);
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: digits,
  }).format(num);
};

export const formatDateTime = (date, options) =>
  new Intl.DateTimeFormat(locale, options).format(date);

const relativeTimeUnit = [
  [1000, 'second'],
  [1000 * 60, 'minute'],
  [1000 * 60 * 60, 'hour'],
  [1000 * 60 * 60 * 24, 'day'],
  [1000 * 60 * 60 * 24 * 7, 'week'],
];
const toRelativeTime = timestamp => {
  const ms = new Date(timestamp).valueOf() - Date.now();
  let count = Math.round(ms / 1000);
  let unit = 'second';
  for (let [threshold, tempUnit] of relativeTimeUnit) {
    const tempCount = Math.round(ms / threshold);
    if (tempCount === 0) break;
    else {
      count = tempCount;
      unit = tempUnit;
    }
  }
  return [count, unit];
};

export const formatRelativeTime = (timestamp, options) =>
  new Intl.RelativeTimeFormat(locale, {
    style: 'long',
    numeric: 'auto',
    ...options,
  }).format(...toRelativeTime(timestamp));
