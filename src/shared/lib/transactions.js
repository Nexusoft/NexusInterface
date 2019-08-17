import {
  loadTransactions,
  addTransactions,
  updateTransaction,
} from 'actions/transactions';
import store, { observeStore } from 'store';
import rpc from 'lib/rpc';

const txPerCall = 100;
const unsubscribers = {};
let started = false;

export async function autoUpdateTransactions() {
  if (!started) {
    await fetchAllTransactions();

    observeStore(
      ({ core: { info } }) => info && info.txtotal,
      (txtotal, store) => {
        const {
          transactions: { lastTxtotal },
        } = store.getState();
        if (txtotal && (!lastTxtotal || txtotal > lastTxtotal)) {
          fetchNewTransactions();
        }
      }
    );

    started = true;
  }
}

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
  store.dispatch(loadTransactions(transactions, txtotal));

  transactions.forEach(tx => {
    if (needsAutoUpdate(tx, minConfirmations)) {
      autoUpdateTxConfirmations(tx.txid);
    }
  });
}

async function fetchNewTransactions() {
  const {
    transactions: { map },
  } = store.getState();
  const txCount = Object.values(map || {}).length;
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
  } = store.getState();
  store.dispatch(
    addTransactions(newTransactions.map(normalizeTransaction), txtotal)
  );

  newTransactions.forEach(tx => {
    if (needsAutoUpdate(tx, minConfirmations)) {
      autoUpdateTxConfirmations(tx.txid);
    }
  });
}

export async function fetchTransaction(txid) {
  const tx = await rpc('gettransaction', [txid]);
  store.dispatch(updateTransaction(normalizeTransaction(tx)));
}

function autoUpdateTxConfirmations(txid) {
  if (unsubscribers[txid]) return;
  unsubscribers[txid] = observeStore(
    ({ core: { info } }) => info && info.blocks,
    async (blocks, store) => {
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

export const isPending = (tx, minConf) =>
  !!minConf && tx.confirmations < Number(minConf) && tx.category !== 'orphan';

// RPC commands return inconsistent transaction schemas so we have to normalize them before using
const normalizeTransaction = tx => ({
  ...tx,
  ...(tx.details && tx.details[0]),
});

const needsAutoUpdate = (tx, minConf) =>
  (minConf && isPending(tx, minConf)) || tx.category === 'immature';
