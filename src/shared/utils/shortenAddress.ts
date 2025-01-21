export default (address?: string | null) =>
  address && address.slice(0, 6) + '…' + address.slice(-5);
