import * as TYPE from 'consts/actionTypes';
import rpc from 'lib/rpc';
import { watchTxConfirmations } from 'lib/transactions';

const txPerCall = 100;

export const fetchAllTransactions = () => async (dispatch, getState) => {
  let transactions = [];
  do {
    const results = await rpc('listtransactions', [
      '*',
      txPerCall,
      transactions.length,
    ]);
    if (Array.isArray(results)) {
      transactions = transactions.concat(results);
    }
  } while (!results || results.length < txPerCall);

  const {
    core: {
      info: { txtotal },
    },
    settings: { minConfirmations },
  } = getState();
  dispatch({
    type: TYPE.FETCH_TRANSACTIONS,
    payload: {
      list: transactions,
      txtotal,
    },
  });

  if (minConfirmations) {
    transactions.forEach(tx => {
      if (tx.confirmations < minConfirmations) {
        watchTxConfirmations(tx.txid);
      }
    });
  }
};

export const fetchNewTransactions = () => async (dispatch, getState) => {
  const {
    transactions: { map },
  } = getState();
  const txCount = Object.values(map).length;
  const newTransactions = await rpc('listtransactions', [
    '*',
    txPerCall,
    txCount,
  ]);

  const {
    core: {
      info: { txtotal },
    },
    settings: { minConfirmations },
  } = getState();
  dispatch({
    type: TYPE.ADD_TRANSACTIONS,
    payload: {
      list: newTransactions,
      txtotal,
    },
  });

  if (minConfirmations) {
    newTransactions.forEach(tx => {
      if (tx.confirmations < minConfirmations) {
        watchTxConfirmations(tx.txid);
      }
    });
  }
};

export const updateTransaction = txid => async (dispatch, getState) => {
  const tx = await rpc('gettransaction', [txid]);
  dispatch({
    type: TYPE.UPDATE_TRANSACTION,
    payload: tx,
  });
};
