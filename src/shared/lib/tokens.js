import React from 'react';

export const getTokenName = (
  { token_name, token },
  { markup } = { markup: true }
) => {
  if (token_name) return token_name;
  if (typeof token === 'string') {
    if (markup) {
      return <span className="dim">{token.substring(0, 3)}...</span>;
    } else {
      return token.substring(0, 3) + '...';
    }
  }
  return 'NXS';
};
