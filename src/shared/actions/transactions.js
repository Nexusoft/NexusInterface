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
