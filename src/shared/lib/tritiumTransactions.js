import { apiPost } from 'lib/tritiumApi';

import store, { observeStore } from 'store';
import * as TYPE from 'consts/actionTypes';
import { loadAccounts } from 'lib/user';
import { showDesktopNotif } from 'utils/misc';
import { formatNumber } from 'lib/intl';
import { showNotification } from 'lib/ui';
import { walletEvents } from 'lib/wallet';
import { legacyMode } from 'consts/misc';

const isConfirmed = tx => !!tx.confirmations;

const unsubscribers = {};
function startWatchingTransaction(txid) {
  if (unsubscribers[txid]) return;
  // Update everytime a new block is received
  unsubscribers[txid] = observeStore(
    ({ core: { systemInfo } }) => systemInfo && systemInfo.blocks,
    async blocks => {
      // Skip because core is most likely disconnected
      if (!blocks) return;

      // Fetch the updated transaction info
      await fetchTransaction(txid);

      const tx = store.getState().core.transactions.map[txid];
      if (tx && isConfirmed(tx)) {
        // If this transaction is already confirmed, unobserve the store
        unsubscribers[txid]();
        delete unsubscribers[txid];
        // Reload the account list
        // so that the account balances (available & unconfirmed) are up-to-date
        loadAccounts();
      }
    }
  );
}

const getBalanceChange = tx =>
  tx.contracts
    ? tx.contracts.reduce((changes, contract) => {
        const sign = getDeltaSign(contract);
        const token = contract.token_name || 'NXS';
        if (sign === '+')
          return {
            ...changes,
            [token]: (changes[token] || 0) + contract.amount,
          };
        if (sign === '-')
          return {
            ...changes,
            [token]: (changes[token] || 0) - contract.amount,
          };
        return changes;
      }, {})
    : 0;

if (!legacyMode) {
  walletEvents.once('post-render', function() {
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
          addTritiumTransactions(transactions);

          transactions.forEach(tx => {
            if (!isConfirmed(tx)) {
              startWatchingTransaction(tx.txid);
            }

            const changes = getBalanceChange(tx);
            if (Object.values(changes).some(v => v)) {
              Object.entries(changes).forEach(([token, change]) => {
                showDesktopNotif(
                  __('New transaction'),
                  `${change > 0 ? '+' : ''}${formatNumber(change, 6)} ${token}`
                );
                showNotification(
                  `${__('New transaction')}: ${
                    change > 0 ? '+' : ''
                  }${formatNumber(change, 6)} ${token}`,
                  'success'
                );
              });
            }
          });
        }
      }
    );
  });
}

/**
 * Public API
 * =============================================================================
 */

export const loadTritiumTransactions = transactions => {
  store.dispatch({
    type: TYPE.LOAD_TRITIUM_TRANSACTIONS,
    payload: {
      list: transactions,
    },
  });
};

export const addTritiumTransactions = newTransactions => {
  store.dispatch({
    type: TYPE.ADD_TRITIUM_TRANSACTIONS,
    payload: {
      list: newTransactions,
    },
  });
};

export const updateTritiumTransaction = tx => {
  store.dispatch({
    type: TYPE.UPDATE_TRITIUM_TRANSACTION,
    payload: tx,
  });
};

export const getDeltaSign = contract => {
  switch (contract.OP) {
    case 'CREDIT':
    case 'COINBASE':
    case 'TRUST':
    case 'GENESIS':
    case 'MIGRATE':
      return '+';

    case 'DEBIT':
    case 'FEE':
    case 'LEGACY':
      return '-';

    default:
      return '';
  }
};

export async function fetchAllTransactions() {
  const {
    core: { userStatus },
  } = store.getState();
  const txCount = userStatus && userStatus.transactions;

  if (!txCount) {
    if (txCount === 0) {
      loadTritiumTransactions([]);
    }
    return;
  }

  const transactions = await apiPost('users/list/transactions', {
    verbose: 'summary',
    limit: txCount,
  });
  loadTritiumTransactions(transactions);
  transactions.forEach(tx => {
    if (!isConfirmed(tx)) {
      startWatchingTransaction(tx.txid);
    }
  });
}

export async function fetchTransaction(txid) {
  const tx = await apiPost('ledger/get/transaction', {
    txid,
    verbose: 'summary',
  });
  updateTritiumTransaction(tx);
}
