// To prevent floating point errors while dealing with nexus amounts

// Max significant digits in a nexus token is 6.
const precision = 1000000;

/**
 * Subtracts all params and delivers reesult
 */
export const subtract = (...numbers: Array<string | number>) =>
  numbers.map((num) => Number(num) * precision).reduce((a, b) => a - b) /
  precision;

/**
 * Adds all params and delivers result
 */
export const add = (...numbers: Array<string | number>) =>
  numbers.map((num) => Number(num) * precision).reduce((a, b) => a + b) /
  precision;

/**
 * Multiplys all params and delivers result
 */
export const multiply = (...numbers: Array<string | number>) =>
  numbers.map((num) => Number(num) * precision).reduce((a, b) => a * b) /
  precision;

/**
 * Divides all params and delivers result
 */
export const divide = (...numbers: Array<string | number>) =>
  numbers.map((num) => Number(num) * precision).reduce((a, b) => a / b) /
  precision;
