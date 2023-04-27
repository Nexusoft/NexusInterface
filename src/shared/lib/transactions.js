import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import rpc from 'lib/rpc';

const txPerCall = 100;
const unsubscribers = {};
let started = false;

async function fetchAllTransactions() {
  let transactions = [];
  let results;
  do {
    try {
      results = await rpc('listtransactions', [
        '*',
        txPerCall,
        transactions.length,
      ]);
    } catch (err) {
      console.error(err);
      return;
    }
    if (Array.isArray(results)) {
      transactions = transactions.concat(results.map(normalizeTransaction));
    }
  } while (results && results.length === txPerCall);

  const {
    core: {
      info: { txtotal },
    },
    settings: { minConfirmations },
  } = store.getState();
  loadTransactions(transactions, txtotal);

  transactions.forEach((tx) => {
    if (needsAutoUpdate(tx, minConfirmations)) {
      autoUpdateTxConfirmations(tx.txid);
    }
  });
}

async function fetchNewTransactions(newTxCount) {
  const newTransactions = await rpc('listtransactions', ['*', newTxCount]);

  const {
    core: {
      info: { txtotal },
    },
    settings: { minConfirmations },
  } = store.getState();
  addTransactions(newTransactions.map(normalizeTransaction), txtotal);

  newTransactions.forEach((tx) => {
    if (needsAutoUpdate(tx, minConfirmations)) {
      autoUpdateTxConfirmations(tx.txid);
    }
  });
}

function autoUpdateTxConfirmations(txid) {
  if (unsubscribers[txid]) return;
  unsubscribers[txid] = observeStore(
    ({ core: { info } }) => info && info.blocks,
    async (blocks) => {
      if (blocks) {
        await fetchTransaction(txid);
        const {
          transactions: { map },
          settings: { minConfirmations },
        } = store.getState();
        const minConf = Number(minConfirmations);
        const tx = map[txid];

        if (!needsAutoUpdate(tx, minConf)) {
          unsubscribers[txid]();
          delete unsubscribers[txid];
        }
      }
    }
  );
}

const loadTransactions = (transactions, txtotal) => {
  store.dispatch({
    type: TYPE.LOAD_TRANSACTIONS,
    payload: {
      list: transactions,
      txtotal,
    },
  });
};

const addTransactions = (newTransactions, txtotal) => {
  store.dispatch({
    type: TYPE.ADD_TRANSACTIONS,
    payload: {
      list: newTransactions,
      txtotal,
    },
  });
};

const updateTransaction = (tx) => {
  store.dispatch({
    type: TYPE.UPDATE_TRANSACTION,
    payload: tx,
  });
};

// RPC commands return inconsistent transaction schemas so we have to normalize them before using
const normalizeTransaction = (tx) => ({
  ...tx,
  ...(tx.details && tx.details[0]),
});

const needsAutoUpdate = (tx, minConf) =>
  (minConf && isPending(tx, minConf)) || tx.category === 'immature';

/**
 * Public API
 * =============================================================================
 */

export const isPending = (tx, minConf) =>
  !!minConf && tx.confirmations < Number(minConf) && tx.category !== 'orphan';

export async function fetchTransaction(txid) {
  const tx = await rpc('gettransaction', [txid]);
  updateTransaction(normalizeTransaction(tx));
}

export async function autoUpdateTransactions() {
  if (!started) {
    await fetchAllTransactions();

    observeStore(
      ({ core: { info } }) => info && info.txtotal,
      (txtotal) => {
        const {
          transactions: { lastTxtotal },
        } = store.getState();
        if (txtotal && (!lastTxtotal || txtotal > lastTxtotal)) {
          fetchNewTransactions(txtotal - lastTxtotal);
        }
      }
    );

    started = true;
  }
}
