import { atom } from 'jotai';
import { callAPI } from 'lib/api';
import { subscribeWithPrevious } from 'lib/store';
import {
  userGenesisAtom,
  loggedInAtom,
  profileStatusQuery,
  txCountAtom,
} from './session';
import jotaiQuery from 'utils/jotaiQuery';
import { showDesktopNotif } from 'utils/misc';
import { formatNumber } from 'lib/intl';
import { showNotification } from 'lib/ui';
import { openErrorDialog } from 'lib/dialog';
import TokenName from 'components/TokenName';

const isConfirmed = (tx) => !!tx.confirmations;

const txCountPerPage = 10;

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

export function prepareTransactions() {
  subscribeWithPrevious(
    profileStatusQuery.valueAtom,
    async (profileStatus, lastProfileStatus) => {
      const justLoggedIn = !lastProfileStatus?.genesis;
      const justSwitched =
        profileStatus?.genesis !== lastProfileStatus?.genesis;

      if (!justLoggedIn && !justSwitched) {
        const txCount = profileStatus?.transactions;
        const oldTxCount = lastProfileStatus?.transactions;
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
        }
      }
    }
  );
}

export const pageAtom = atom(1);
export const addressQueryAtom = atom('');
export const operationAtom = atom(null);
export const timeSpanAtom = atom(null);

export const transactionsQuery = jotaiQuery({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => {
    const page = get(pageAtom);
    const addressQuery = get(addressQueryAtom);
    const operation = get(operationAtom);
    const timeSpan = get(timeSpanAtom);
    const genesis = get(userGenesisAtom);

    return {
      queryKey: [
        'transactions',
        { genesis, page, addressQuery, operation, timeSpan },
      ],
      queryFn: async () => {
        try {
          const params = {
            verbose: 'summary',
            limit: txCountPerPage,
            // API page param is 0 based, while the page number on the UI is 1 based
            page: page - 1,
          };
          const query = buildQuery({ addressQuery, operation, timeSpan });
          if (query) {
            params.where = query;
          }
          return await callAPI('profiles/transactions/master', params);
        } catch (err) {
          openErrorDialog({
            message: __('Error fetching transactions'),
            note:
              typeof err === 'string'
                ? err
                : err?.message || __('Unknown error'),
          });
          throw err;
        }
      },
      staleTime: 300000, // 5 minutes
      gcTime: 0,
      refetchInterval: ({ state: { data } }) =>
        data?.some((tx) => !isConfirmed(tx)) ? 5000 : false,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
    };
  },
  refetchTriggers: [txCountAtom],
});
