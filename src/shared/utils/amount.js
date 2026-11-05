'use strict';

const MAX_UNITS = 18446744073709551615n;
const MAX_SAFE_UNITS = BigInt(Number.MAX_SAFE_INTEGER);

function amountUnits(value, decimals) {
  if (
    typeof value !== 'string' ||
    value.length > 128 ||
    !/^\d+(?:\.\d+)?$/.test(value) ||
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 8
  ) {
    throw new TypeError('Invalid amount or asset precision');
  }
  const [whole, fraction = ''] = value.split('.');
  if (fraction.length > decimals) {
    throw new TypeError('Amount exceeds asset precision');
  }
  const units = BigInt(whole + fraction.padEnd(decimals, '0'));
  if (units === 0n || units > MAX_UNITS) {
    throw new TypeError('Amount is out of range');
  }
  return units;
}

function validateCoreAmount(value) {
  if (typeof value === 'number') {
    const text = String(value);
    const decimals = (text.split('.')[1] || '').length;
    if (!Number.isFinite(value) || amountUnits(text, decimals) > MAX_SAFE_UNITS) {
      throw new TypeError('Numeric amount cannot be represented safely');
    }
    return value;
  }
  const decimals =
    typeof value === 'string' ? (value.split('.')[1] || '').length : 0;
  amountUnits(value, decimals);
  return value;
}

module.exports = { amountUnits, validateCoreAmount };
