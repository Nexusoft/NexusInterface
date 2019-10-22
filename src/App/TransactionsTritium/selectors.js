import memoize from 'utils/memoize';

const getThresholdDate = timeSpan => {
  const now = new Date();
  switch (timeSpan) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return null;
  }
};

export const getTransactionsList = memoize(
  txMap =>
    txMap &&
    Object.values(txMap).sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
);

export const txPerPage = 10;
export const paginateTransactions = memoize(
  (transactions, page) =>
    transactions && transactions.slice((page - 1) * txPerPage, page * txPerPage)
);

export const getFilteredTransactions = memoize(
  (allTransactions, nameQuery, addressQuery, operation, timeSpan) =>
    allTransactions &&
    allTransactions
      .filter(tx => {
        // Filter by Time
        if (timeSpan) {
          const pastDate = getThresholdDate(timeSpan);
          if (!pastDate) return true;
          else return tx.timestamp * 1000 > pastDate.getTime();
        }
        return true;
      })
      .map(tx => ({
        ...tx,
        contracts:
          tx.contracts &&
          tx.contracts.filter(contract => {
            // Filter by Address
            if (addressQuery) {
              const address = addressQuery.toLowerCase();
              // If no fields match the address query
              if (
                !(
                  contract.address &&
                  contract.address.toLowerCase().includes(address)
                ) &&
                !(
                  contract.from && contract.from.toLowerCase().includes(address)
                ) &&
                !(contract.to && contract.to.toLowerCase().includes(address)) &&
                !(
                  contract.token &&
                  contract.token.toLowerCase().includes(address)
                ) &&
                !(
                  contract.account &&
                  contract.account.toLowerCase().includes(address)
                )
              ) {
                return false;
              }
            }

            // Filter by Name
            if (nameQuery) {
              const name = nameQuery.toLowerCase();
              // If no fields match the name query
              if (
                !(
                  contract.from_name &&
                  contract.from_name.toLowerCase().includes(name)
                ) &&
                !(
                  contract.to_name &&
                  contract.to_name.toLowerCase().includes(name)
                ) &&
                !(
                  contract.account_name &&
                  contract.account_name.toLowerCase().includes(name)
                ) &&
                !(
                  contract.token_name &&
                  contract.token_name.toLowerCase().includes(name)
                )
              ) {
                return false;
              }
            }

            // Filter by Operation
            if (operation && contract.OP !== operation) return false;

            // // Filter by Amount
            // const min = Number(minAmount) || 0;
            // if (min && tx.amount < min) return false;

            return true;
          }),
      }))
      .filter(tx => tx.contracts && tx.contracts.length > 0)
);

export const getContractList = memoize(txMap => {
  const txList = getTransactionsList(txMap);
  return txList.reduce((list, tx) => {
    if (!tx.contracts) return list;
    const { contracts, ...txInfo } = tx;
    return [...list, ...contracts.map(contract => ({ ...contract, txInfo }))];
  }, []);
});
