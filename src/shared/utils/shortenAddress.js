export default (address) =>
  address && address.slice(0, 6) + '…' + address.slice(-5);
