import React from 'react';
import * as color from './color';
import * as language from './language';
import * as form from './form';

export const newUID = (function() {
  let counter = 1;
  return () => `uid-${counter++}`;
})();

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711
export function escapeRegExp(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function highlightMatchingText(text, query, HighlightComponent) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'i');
  const segments = text.split(regex).map((segment, i) => {
    if (regex.test(segment)) {
      return <HighlightComponent key={i}>{segment}</HighlightComponent>;
    } else {
      return <span key={i}>{segment}</span>;
    }
  });
  return segments;
}

export { color, language, form };
