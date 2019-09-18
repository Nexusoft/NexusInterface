import * as TYPE from 'consts/actionTypes';

export const loadTransactions = (transactions, txtotal) => ({
  type: TYPE.LOAD_TRANSACTIONS,
  payload: {
    list: transactions,
    txtotal,
  },
});

export const addTransactions = (newTransactions, txtotal) => ({
  type: TYPE.ADD_TRANSACTIONS,
  payload: {
    list: newTransactions,
    txtotal,
  },
});

export const updateTransaction = tx => ({
  type: TYPE.UPDATE_TRANSACTION,
  payload: tx,
});

export const loadTritiumTransactions = transactions => ({
  type: TYPE.LOAD_TRITIUM_TRANSACTIONS,
  payload: {
    list: transactions,
  },
});

export const addTritiumTransactions = newTransactions => ({
  type: TYPE.ADD_TRITIUM_TRANSACTIONS,
  payload: {
    list: newTransactions,
  },
});

export const updateTritiumTransaction = tx => ({
  type: TYPE.UPDATE_TRITIUM_TRANSACTION,
  payload: tx,
});
