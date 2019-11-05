// To prevent floating point errors while dealing with nexus amounts

// Max significant digits in a nexus token is 5
const precision = 100000;

/**
 * Subtracts all params and delivers reesult
 *
 * @param {[float]} numbers
 * @returns {float} result of subtracted numbers
 */
export const subtract = (...numbers) =>
  numbers.map(num => Number(num) * precision).reduce((a, b) => a - b) /
  precision;

/**
 * Adds all params and delivers result
 *
 * @param {[float]} numbers
 * @returns {float} result of additioned numbers
 */
export const add = (...numbers) =>
  numbers.map(num => Number(num) * precision).reduce((a, b) => a + b) /
  precision;

/**
 * Multiplys all params and delivers result
 *
 * @param {[float]} numbers
 * @returns {float} result of multiplied numbers
 */
export const multiply = (...numbers) =>
  numbers.map(num => Number(num) * precision).reduce((a, b) => a * b) /
  precision;

/**
 * Divides all params and delivers result
 *
 * @param {[float]} numbers
 * @returns {float} result of Divided numbers
 */
export const divide = (...numbers) =>
  numbers.map(num => Number(num) * precision).reduce((a, b) => a / b) /
  precision;
