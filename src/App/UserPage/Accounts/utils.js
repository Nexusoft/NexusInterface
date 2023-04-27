export function totalBalance(account) {
  const {
    balance = 0,
    unclaimed = 0,
    unconfirmed = 0,
    stake = 0,
    immature = 0,
  } = account;
  return balance + unclaimed + unconfirmed + stake + immature;
}
