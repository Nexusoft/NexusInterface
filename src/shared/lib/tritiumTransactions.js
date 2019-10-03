import { apiPost } from 'lib/tritiumApi';

import store, { observeStore } from 'store';
import * as TYPE from 'consts/actionTypes';
import { loadAccounts } from 'lib/user';
import { showDesktopNotif } from 'utils/misc';
import { formatNumber } from 'lib/intl';
import { showNotification } from 'lib/ui';

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
          loadAccounts();
        }
      }
    }
  );
}

const getBalanceChange = tx =>
  tx.contracts
    ? tx.contracts.reduce((changes, contract) => {
        const sign = getDeltaSign(contract);
        const token = tx.token_name || 'NXS';
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

/**
 * Public API
 * =============================================================================
 */

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

export const isPending = (tx, minConf) =>
  !!minConf && tx.confirmations < Number(minConf);

export async function fetchAllTransactions() {
  const {
    core: { userStatus },
    settings: { minConfirmations },
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
        addTritiumTransactions(transactions);

        const {
          settings: { minConfirmations },
        } = store.getState();
        transactions.forEach(tx => {
          if (needsAutoUpdate(tx, minConfirmations)) {
            autoUpdateTransaction(tx.txid);
          }

          const changes = getBalanceChange(tx);
          if (Object.values(changes).some(v => v)) {
            Object.entries(changes).forEach(([token, change]) => {
              showDesktopNotif(
                __('New transaction'),
                `${change > 0 ? '+' : ''}${formatNumber(change)} ${token}`
              );
              showNotification(
                `${__('New transaction')}: ${
                  change > 0 ? '+' : ''
                }${formatNumber(change)} ${token}`,
                'success'
              );
            });
          }
        });
      }
    }
  );
}

export async function fetchTransaction(txid) {
  const tx = await apiPost('ledger/get/transaction', {
    txid,
    verbose: 'summary',
  });
  updateTritiumTransaction(tx);
}
