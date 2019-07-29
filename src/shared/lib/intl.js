import React from 'react';
import fs from 'fs';
import path from 'path';
import Polyglot from 'node-polyglot';

import { assetsDir } from 'consts/paths';
import { LoadSettings } from 'lib/settings';
import { escapeRegExp } from 'utils/misc';

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

export { translate };

export const formatNumber = (num, maxDecimalDigits) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: maxDecimalDigits,
  }).format(num);

export const formatCurrency = (num, currency = 'USD', maxDecimalDigits) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: maxDecimalDigits,
  }).format(num);

export const formatPercent = (num, maxDecimalDigits) =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: maxDecimalDigits,
  }).format(num);

export const formatDateTime = (date, options) =>
  new Intl.DateTimeFormat(locale, options).format(date);
