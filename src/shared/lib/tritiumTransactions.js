import { apiPost } from 'lib/tritiumApi';

import store, { observeStore } from 'store';
import {
  loadTritiumTransactions,
  addTritiumTransactions,
  updateTritiumTransaction,
} from 'actions/transactions';
import { listAccounts } from 'actions/core';

export async function fetchAllTransactions() {
  const {
    core: { userStatus },
    settings: { minConfirmations },
  } = store.getState();
  const txCount = userStatus && userStatus.transactions;

  if (!txCount) {
    if (txCount === 0) {
      store.dispatch(loadTritiumTransactions([]));
    }
    return;
  }

  const transactions = await apiPost('users/list/transactions', {
    verbose: 'summary',
    limit: txCount,
  });
  store.dispatch(loadTritiumTransactions(transactions));
  transactions.forEach(tx => {
    if (needsAutoUpdate(tx, minConfirmations)) {
      autoUpdateTransaction(tx.txid);
    }
  });
}

export function initializeTransactions() {
  observeStore(
    ({ core: { userStatus } }) => userStatus && userStatus.transactions,
    async (txCount, oldTxCount) => {
      if (
        typeof txCount === 'number' &&
        typeof oldTxCount === 'number' &&
        txCount > oldTxCount
      ) {
        const transactions = await apiPost('users/list/transactions', {
          verbose: 'summary',
          limit: txCount - oldTxCount,
        });
        store.dispatch(addTritiumTransactions(transactions));

        const {
          settings: { minConfirmations },
        } = store.getState();
        transactions.forEach(tx => {
          if (needsAutoUpdate(tx, minConfirmations)) {
            autoUpdateTransaction(tx.txid);
          }
        });

        // TODO: show desktop notification
      }
    }
  );
}

export async function fetchTransaction(txid) {
  const tx = await apiPost('ledger/get/transaction', {
    txid,
    verbose: 'summary',
  });
  store.dispatch(updateTritiumTransaction(tx));
}

export const isPending = (tx, minConf) =>
  !!minConf && tx.confirmations < Number(minConf);

const isUnconfirmed = tx => tx.confirmations === 0;

const needsAutoUpdate = (tx, minConf) =>
  isUnconfirmed(tx) || isPending(tx, minConf);

const unsubscribers = {};
function autoUpdateTransaction(txid) {
  if (unsubscribers[txid]) return;
  unsubscribers[txid] = observeStore(
    ({ core: { systemInfo } }) => systemInfo && systemInfo.blocks,
    async blocks => {
      if (blocks) {
        const oldTx = store.getState().core.transactions.map[txid];
        const wasUnconfirmed = isUnconfirmed(oldTx);

        await fetchTransaction(txid);
        const {
          core: {
            transactions: { map },
          },
          settings: { minConfirmations },
        } = store.getState();
        const minConf = Number(minConfirmations);
        const tx = map[txid];

        // If this transaction no longer needs auto update, unobserve the store
        if (tx && !needsAutoUpdate(tx, minConf)) {
          unsubscribers[txid]();
          delete unsubscribers[txid];
        }

        // If a transaction has just been confirmed, reload the account list
        // so that the account balances (available & unconfirmed) are up-to-date
        if (wasUnconfirmed && !isUnconfirmed(tx)) {
          store.dispatch(listAccounts());
        }
      }
    }
  );
}
