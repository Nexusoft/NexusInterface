export function totalBalance(account) {
  const {
    balance = 0,
    pending = 0,
    unconfirmed = 0,
    stake = 0,
    immature = 0,
  } = account;
  return balance + pending + unconfirmed + stake + immature;
}
