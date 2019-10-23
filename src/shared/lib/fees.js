export const namedAccount = 1;

export const localName = 1;

export const asset = bytes => 0.01 * bytes;

export const token = (supply, decimal) => {
  const totalSupply = supply * Math.pow(10, decimal || 0);
  const fee = (Math.log10(totalSupply) - 2) * 100;
  return fee ? (fee <= 0 ? 1 : fee) : 1;
};

export const namespace = 1000;

export const global = 2000;
