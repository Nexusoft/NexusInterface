import {
  loadTransactions,
  addTransactions,
  updateTransaction,
} from 'actions/transactions';
import store, { observeStore } from 'store';

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
  } = store.getState();
  store.dispatch(loadTransactions(transactions, txtotal));

  if (minConfirmations) {
    transactions.forEach(tx => {
      if (tx.confirmations < minConfirmations) {
        autoUpdateTxConfirmations(tx.txid);
      }
    });
  }
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
  store.dispatch(addTransactions(newTransactions, txtotal));

  if (minConfirmations) {
    newTransactions.forEach(tx => {
      if (tx.confirmations < minConfirmations) {
        autoUpdateTxConfirmations(tx.txid);
      }
    });
  }
}

async function fetchTransaction(txid) {
  const tx = await rpc('gettransaction', [txid]);
  store.dispatch(updateTransaction(tx));
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

        if (minConf && tx.confirmations >= minConf) {
          unsubscribers[txid]();
          delete unsubscribers[txid];
        }
      }
    }
  );
}
