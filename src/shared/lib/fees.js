export const asset = (bytes) => 0.01 * bytes;

const roundTo6DecimalPlaces = (number) =>
  Math.round(number * 1000000) / 1000000;

export const createTokenFee = (supply, decimal) => {
  const totalSupply = supply * Math.pow(10, decimal || 0);
  const fee = roundTo6DecimalPlaces((Math.log10(totalSupply) - 2) * 100);
  return fee ? (fee <= 0 ? 1 : fee) : 1;
};

export const createNamespaceFee = 1000;

export const createGlobalNameFee = 2000;

export const createNamespacedNameFee = 1;

export const createLocalNameFee = 1;
