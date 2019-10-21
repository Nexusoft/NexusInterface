export const namedAccount = 1;

export const localName = 1;

export const asset = bytes => 0.01 * bytes;

export const token = (supply, decimal) =>
  (Math.log10(supply * Math.max(1, decimal)) - 2) * 100;

export const namespace = 1000;

export const global = 2000;
