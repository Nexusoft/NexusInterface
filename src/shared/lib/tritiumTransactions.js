import { apiPost } from 'lib/tritiumApi';

import store from 'store';
import {
  loadTritiumTransactions,
  addTritiumTransactions,
  updateTritiumTransaction,
} from 'actions/transactions';

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
      // autoUpdateTxConfirmations(tx.txid);
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

        // Show desktop notif
      }
    }
  );
  // observeStore to load new Transactions
  // show desktop notification when there's new transactions
}
