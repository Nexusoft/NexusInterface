import fs from 'fs';
import path from 'path';
import { ReactNode } from 'react';
import Polyglot from 'node-polyglot';
import { parse } from 'csv-parse/sync';

import { store } from 'lib/store';
import { assetsDir } from 'consts/paths';
import { settingAtoms } from 'lib/settings';
import { escapeRegExp } from 'utils/misc';

export type Locale =
  | 'en'
  | 'ar'
  | 'de'
  | 'es'
  | 'fi'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'no'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'sr'
  | 'zh-cn';

const locales: Locale[] = [
  'en',
  'ar',
  'de',
  'es',
  'fi',
  'fr',
  'ja',
  'ko',
  'no',
  'nl',
  'pl',
  'pt',
  'ru',
  'sr',
  'zh-cn',
];

function loadDict(locale: Locale) {
  const csv = fs.readFileSync(
    path.join(assetsDir, 'translations', `${locale}.csv`)
  );
  const records: any[] = parse(csv);
  const dict: Record<string, Record<string, string>> = {};
  records.forEach(([key, translation, context]) => {
    if (!dict[context]) {
      dict[context] = {};
    }
    dict[context][key] = translation;
  });
  return dict;
}

type Interpolations = Parameters<typeof Polyglot.transformPhrase>[1];

const locale = (() => {
  const loc = store.get(settingAtoms.locale);
  return locales.includes(loc) ? loc : 'en';
})();
const dict = locale === 'en' ? null : loadDict(locale);
const engTranslate = (_context: string, phrase: string, data: Interpolations) =>
  Polyglot.transformPhrase(phrase, data, 'en');

const rawTranslate =
  locale === 'en'
    ? engTranslate
    : (context: string, string: string, data: Interpolations) => {
        const phrases = dict?.[context];
        const phrase = (phrases && phrases[string]) || string;
        return Polyglot.transformPhrase(phrase, data, locale);
      };

type FirstMatch = { match: RegExpMatchArray; key: string };
type Injections = Record<string, string | ((inner: ReactNode) => ReactNode)>;

function inject(string: string): string;
function inject(string: string, injections: Injections): ReactNode;
function inject(string: string, injections?: Injections): string | ReactNode {
  if (injections) {
    // Process from the first match in the string
    let first: FirstMatch | null = null;
    for (let key in injections) {
      const escaped = escapeRegExp(String(key));
      const regex = new RegExp(`<${escaped}>(.*?)<\/${escaped}>`, 'm');
      const match = string.match(regex);
      if (
        match &&
        (!first?.match.index || !match.index || match.index < first.match.index)
      ) {
        first = { match, key };
      }
    }
    if (first) {
      const before = string.slice(0, first.match.index);
      const after = string.slice(
        (first.match.index || 0) + first.match[0].length
      );
      const inner = inject(first.match[1], injections);
      const injection = injections[first.key];
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

export function translateWithContext(
  context: string,
  string: string,
  data?: Interpolations
): string;
export function translateWithContext(
  context: string,
  string: string,
  data: Interpolations | undefined,
  injections: Injections
): ReactNode;
export function translateWithContext(
  context = '',
  string: string,
  data?: Interpolations,
  injections?: Injections
) {
  const translated = rawTranslate(context, string, data);
  if (injections) return inject(translated, injections);
  return translated;
}

export function translate(string: string, data?: Interpolations): string;
export function translate(
  string: string,
  data: Interpolations | undefined,
  injections: Injections
): ReactNode;
export function translate(
  string: string,
  data?: Interpolations,
  injections?: Injections
) {
  if (injections) return translateWithContext('', string, data, injections);
  return translateWithContext('', string, data);
}

export function withContext(context: string) {
  function trans(string: string, data?: Interpolations): string;
  function trans(
    string: string,
    data: Interpolations | undefined,
    injections: Injections
  ): ReactNode;
  function trans(
    string: string,
    data?: Interpolations,
    injections?: Injections
  ) {
    if (injections)
      return translateWithContext(context, string, data, injections);
    return translateWithContext(context, string, data);
  }
  return trans;
}

const ensureSignificantDigit = (decimalDigits: number, num: number) => {
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

export const formatNumber = (num: number, maxDecimalDigits = 3) => {
  const digits = ensureSignificantDigit(maxDecimalDigits, num);
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
  }).format(num);
};

export const formatCurrency = (
  num: number,
  currency = 'USD',
  maxDecimalDigits = 3
) => {
  // VND doesn't have decimal digits
  if (currency === 'VND') {
    maxDecimalDigits = 0;
  }
  const digits = ensureSignificantDigit(maxDecimalDigits, num);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(num);
};

export const formatPercent = (num: number, maxDecimalDigits: number) => {
  const digits = ensureSignificantDigit(maxDecimalDigits, num);
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: digits,
  }).format(num);
};

export const formatDateTime = (
  date: Date,
  options: Intl.DateTimeFormatOptions
) => (date ? new Intl.DateTimeFormat(locale, options).format(date) : 'Invalid');

const relativeTimeUnit = [
  [1000, 'second'],
  [1000 * 60, 'minute'],
  [1000 * 60 * 60, 'hour'],
  [1000 * 60 * 60 * 24, 'day'],
  [1000 * 60 * 60 * 24 * 7, 'week'],
] as const;

const toRelativeTime = (timestamp: number) => {
  const ms = new Date(timestamp).valueOf() - Date.now();
  let count = Math.round(ms / 1000);
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  for (let [threshold, tempUnit] of relativeTimeUnit) {
    const tempCount = Math.round(ms / threshold);
    if (tempCount === 0) break;
    else {
      count = tempCount;
      unit = tempUnit;
    }
  }
  return [count, unit] as const;
};

export const formatRelativeTime = (
  timestamp: number,
  options: Intl.RelativeTimeFormatOptions
) =>
  new Intl.RelativeTimeFormat(locale, {
    style: 'long',
    numeric: 'auto',
    ...options,
  }).format(...toRelativeTime(timestamp));
