// To prevent floating point errors while dealing with nexus amounts

// Max significant digits in a nexus token is 5
const precision = 100000;

/**
 * Subtracts all params and delivers reesult
 *
 * @param {[float]} digits
 * @returns {float} result of subtracted digits
 */
export const Subtract = digits => {
  return (
    digits
      .map(el => {
        return parseInt(el) * precision;
      })
      .reduce((a, b) => a - b) / precision
  );
};

/**
 * Adds all params and delivers result
 *
 * @param {[float]} digits
 * @returns {float} result of additioned digits
 */
export const Add = digits => {
  return (
    digits
      .map(el => {
        return parseInt(el) * precision;
      })
      .reduce((a, b) => a + b) / precision
  );
};

/**
 * Multiplys all params and delivers result
 *
 * @param {[float]} digits
 * @returns {float} result of multiplied digits
 */
export const Multiply = digits => {
  return (
    digits
      .map(el => {
        return parseInt(el) * precision;
      })
      .reduce((a, b) => a * b) / precision
  );
};

/**
 * Divides all params and delivers result
 *
 * @param {[float]} digits
 * @returns {float} result of Divided digits
 */
export const Divide = digits => {
  return (
    digits
      .map(el => {
        return parseInt(el) * precision;
      })
      .reduce((a, b) => a / b) / precision
  );
};
