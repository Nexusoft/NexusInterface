import { callAPI } from 'lib/api';
import store, { observeStore } from 'store';
import * as TYPE from 'consts/actionTypes';
import { loadAccounts } from 'lib/user';
import { showDesktopNotif } from 'utils/misc';
import { formatNumber } from 'lib/intl';
import { showNotification } from 'lib/ui';
import { openErrorDialog } from 'lib/dialog';
import TokenName from 'components/TokenName';
import { isLoggedIn } from 'selectors';

const isConfirmed = (tx) => !!tx.confirmations;

const txCountPerPage = 10;

let watchedIds = [];
let unsubscribe = null;
function startWatcher() {
  unsubscribe = observeStore(
    (state) => state,
    async (state, oldState) => {
      // Clear watcher if user is logged out or core is disconnected or user is switched
      const genesis = state?.user.status?.genesis;
      const oldGenesis = oldState?.user.status?.genesis;
      if (!isLoggedIn(state) || genesis !== oldGenesis) {
        unsubscribe?.();
        unsubscribe = null;
        watchedIds = [];
      }

      // Only refetch transaction each time there is a new block
      const blocks = state?.core.systemInfo?.blocks;
      const oldBlocks = oldState?.core.systemInfo?.blocks;
      if (!blocks || blocks === oldBlocks) return;

      // Fetch the updated transaction info
      const transactions = await Promise.all([
        watchedIds.map((txid) => fetchTransaction(txid)),
      ]);

      for (const tx of transactions) {
        if (isConfirmed(tx)) {
          unwatchTransaction(tx.txid);
          // Reload the account list
          // so that the account balances (available & unconfirmed) are up-to-date
          loadTransactions();
          loadAccounts();
        }
      }
    }
  );
}

function watchTransaction(txid) {
  if (!watchedIds.includes(txid)) {
    watchedIds.push(txid);
  }
  if (!unsubscribe) {
    startWatcher();
  }
}

function unwatchTransaction(txid) {
  watchedIds = watchedIds.filter((id) => id !== txid);
  if (!watchedIds.length) {
    unsubscribe?.();
    unsubscribe = null;
  }
}

function watchIfUnconfirmed(transactions) {
  transactions?.forEach((tx) => {
    if (!isConfirmed(tx)) {
      watchTransaction(tx.txid);
    }
  });
}

const getBalanceChanges = (tx) =>
  tx.contracts
    ? tx.contracts.reduce((changes, contract) => {
        const sign = getDeltaSign(contract);
        if (sign && contract.amount) {
          let change = changes.find(
            contract.ticker || contract.token_name
              ? (change) =>
                  change.ticker === contract.ticker || contract.token_name
              : (change) => change.token === contract.token
          );
          if (change) {
            change.amount =
              change.amount + (sign === '-' ? -1 : 1) * contract.amount;
          } else {
            change = {
              ticker: contract.ticker || contract.token_name,
              token: contract.token,
              amount: (sign === '-' ? -1 : 1) * contract.amount,
            };
            changes.push(change);
          }
        }
        return changes;
      }, [])
    : 0;

const getThresholdDate = (timeSpan) => {
  const now = new Date();
  switch (timeSpan) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return null;
  }
};

function filterTransactions(transactions) {
  const {
    ui: {
      transactionsFilter: { addressQuery, operation, timeSpan, page },
    },
    user: {
      transactions: { status },
    },
  } = store.getState();
  if (status !== 'loaded' || page !== 1 || !transactions) return [];

  return transactions.filter((tx) => {
    if (timeSpan) {
      const pastDate = getThresholdDate(timeSpan);
      if (pastDate && tx.timestamp * 1000 < pastDate.getTime()) {
        return false;
      }
    }
    if (
      operation &&
      !tx.contracts.some((contract) => contract.OP === operation)
    ) {
      return false;
    }
    if (addressQuery) {
      if (addressQuery === '0') {
        if (!tx.contracts.some((contract) => contract.token === '0')) {
          return false;
        }
      } else {
        if (
          !tx.contracts.some(
            (contract) =>
              contract.token?.includes(addressQuery) ||
              contract.from?.includes(addressQuery) ||
              contract.to?.includes(addressQuery) ||
              contract.account?.includes(addressQuery) ||
              contract.destination?.includes(addressQuery) ||
              contract.address?.includes(addressQuery)
          )
        ) {
          return false;
        }
      }
    }

    return true;
  });
}

function buildQuery({ addressQuery, operation, timeSpan }) {
  const queries = [];
  if (timeSpan) {
    const pastDate = getThresholdDate(timeSpan);
    if (pastDate) {
      queries.push(`results.timestamp>${pastDate.getTime() / 1000}`);
    }
  }
  if (operation) {
    queries.push(`results.contracts.OP=${operation}`);
  }
  if (addressQuery) {
    if (addressQuery === '0') {
      queries.push(`results.contracts.token=0`);
    } else {
      const buildAddressQuery = (field) =>
        `results.contracts.${field}=*${addressQuery}*`;
      const addressQueries = [
        buildAddressQuery('token'),
        buildAddressQuery('from.address'),
        buildAddressQuery('to.address'),
        buildAddressQuery('recipient.address'),
        buildAddressQuery('address'),
      ];
      queries.push(`(${addressQueries.join(' OR ')})`);
    }
  }

  return queries.join(' AND ') || undefined;
}

/**
 * Public API
 * =============================================================================
 */

export async function loadTransactions() {
  const {
    ui: { transactionsFilter },
  } = store.getState();
  const { page } = transactionsFilter;
  store.dispatch({
    type: TYPE.START_FETCHING_TXS,
  });
  try {
    const params = {
      verbose: 'summary',
      limit: txCountPerPage,
      // API page param is 0 based, while the page number on the UI is 1 based
      page: page - 1,
    };
    const query = buildQuery(transactionsFilter);
    if (query) {
      params.where = query;
    }
    const transactions = await callAPI('profiles/transactions/master', params);
    store.dispatch({
      type: TYPE.FETCH_TXS_RESULT,
      payload: {
        transactions,
        lastPage: transactions.length < txCountPerPage,
      },
    });
    watchIfUnconfirmed(transactions);
  } catch (err) {
    store.dispatch({
      type: TYPE.FETCH_TXS_ERROR,
    });
    openErrorDialog({
      message: __('Error fetching transactions'),
      note: typeof err === 'string' ? err : err?.message || __('Unknown error'),
    });
  }
}

export async function updateFilter(updates) {
  store.dispatch({
    type: TYPE.UPDATE_TRANSACTIONS_FILTER,
    payload: { ...updates, page: 1 },
  });
  return await loadTransactions();
}

export async function updatePage(page) {
  store.dispatch({
    type: TYPE.UPDATE_TRANSACTIONS_FILTER,
    payload: { page },
  });
  return await loadTransactions();
}

export const getDeltaSign = (contract) => {
  switch (contract.OP) {
    case 'CREDIT':
    case 'COINBASE':
    case 'TRUST':
    case 'GENESIS':
    case 'TRUSTPOOL':
    case 'GENESISPOOL':
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

export async function fetchTransaction(txid) {
  const tx = await callAPI('ledger/get/transaction', {
    txid,
    verbose: 'summary',
  });
  store.dispatch({
    type: TYPE.UPDATE_TRANSACTIONS,
    payload: [tx],
  });
  return tx;
}

export function prepareTransactions() {
  observeStore(
    ({ user: { profileStatus } }) => profileStatus,
    async (status, oldStatus) => {
      // Skip if user was just switched
      if (status?.genesis !== oldStatus?.genesis) return;

      const txCount = status?.transactions;
      const oldTxCount = oldStatus?.transactions;
      if (
        typeof txCount === 'number' &&
        typeof oldTxCount === 'number' &&
        txCount > oldTxCount
      ) {
        const transactions = await callAPI('profiles/transactions/master', {
          verbose: 'summary',
          limit: txCount - oldTxCount,
        });

        for (const tx of transactions) {
          const changes = getBalanceChanges(tx);
          if (changes.length) {
            const changeLines = changes.map(
              (change) =>
                `${change.amount >= 0 ? '+' : ''}${formatNumber(
                  change.amount,
                  6
                )} ${TokenName.from({ contract: change })}`
            );
            showDesktopNotif(__('New transaction'), changeLines.join(' \n'));
            showNotification(
              `${__('New transaction')}: ${changeLines.join(' | ')}`,
              'success'
            );
          }
        }

        const filteredTransactions = filterTransactions(transactions);
        if (filteredTransactions.length) {
          store.dispatch({
            type: TYPE.UPDATE_TRANSACTIONS,
            payload: filteredTransactions,
          });
          watchIfUnconfirmed(filteredTransactions);
        }
      }
    }
  );
}
