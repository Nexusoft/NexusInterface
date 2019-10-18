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
  (allTransactions, accountName, addressQuery, operation, timeSpan) =>
    allTransactions &&
    allTransactions.filter(tx => {
      // // Filter by Address
      // if (
      //   addressQuery &&
      //   tx.address &&
      //   !tx.address.toLowerCase().includes(addressQuery.toLowerCase())
      // ) {
      //   return false;
      // }

      // // Filter by Name
      // if (
      //   accountName &&
      //   !tx.contracts.some(
      //     c =>
      //       (c.from_name && c.from_name === accountName) ||
      //       (c.to_name && c.to_name !== accountName) ||
      //       (c.account_name && c.account_name !== accountName)
      //   )
      // ) {
      //   return false;
      // }

      // // Filter by Category
      // if (category && tx.category !== category) return false;

      // // Filter by Amount
      // const min = Number(minAmount) || 0;
      // if (min && tx.amount < min) return false;

      // // Filter by Time
      // if (timeSpan) {
      //   const pastDate = getThresholdDate(timeSpan);
      //   if (!pastDate) return true;
      //   else return new Date(tx.time * 1000).getTime() > pastDate.getTime();
      // }

      return true;
    })
);

export const getContractList = memoize(txMap => {
  const txList = getTransactionsList(txMap);
  return txList.reduce((list, tx) => {
    if (!tx.contracts) return list;
    const { contracts, ...txInfo } = tx;
    return [...list, ...contracts.map(contract => ({ ...contract, txInfo }))];
  }, []);
});
