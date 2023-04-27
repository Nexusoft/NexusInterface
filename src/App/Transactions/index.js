import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import GA from 'lib/googleAnalytics';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Panel from 'components/Panel';
import RequireCoreConnected from 'components/RequireCoreConnected';
import WaitingMessage from 'components/WaitingMessage';
import Select from 'components/Select';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Table from 'components/Table';
import { formatDateTime } from 'lib/intl';
import { openModal, setTxsAccountFilter } from 'lib/ui';
import { autoUpdateTransactions, isPending } from 'lib/transactions';
import { isCoreConnected } from 'selectors';

import TransactionDetailsModal from './TransactionDetailsModal';
import Filters from './Filters';
import {
  getFilteredTransactions,
  getTransactionsList,
  getAccountOptions,
  withFakeTxs,
} from './selectors';
import { saveCSV } from './utils';
import TransactionsChartModal from './TransactionsChartModal';
import CategoryCell from './CategoryCell';

import transactionIcon from 'icons/transaction.svg';
import barChartIcon from 'icons/bar-chart.svg';
import downloadIcon from 'icons/download.svg';

__ = __context('Transactions');

const timeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const tableColumns = [
  {
    id: 'time',
    Header: __('Time'),
    accessor: 'time',
    Cell: (cell) => formatDateTime(cell.value * 1000, timeFormatOptions),
    width: 200,
  },
  {
    id: 'category',
    Header: __('CATEGORY'),
    accessor: 'category',
    Cell: (cell) => <CategoryCell transaction={cell.original} />,
    width: 120,
  },
  {
    id: 'amount',
    Header: __('AMOUNT'),
    accessor: 'amount',
    width: 100,
  },
  {
    id: 'account',
    Header: __('ACCOUNT'),
    accessor: 'account',
    width: 150,
  },
  {
    id: 'address',
    Header: __('ADDRESS'),
    accessor: 'address',
  },
];

const AccountSelect = styled(Select)({
  marginLeft: '1em',
  minWidth: 200,
  fontSize: 15,
});

const TransactionsLayout = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"filters" "table"',
  gridTemplateRows: 'min-content 1fr',
});

const TransactionsTable = styled(Table)({
  gridArea: 'table',
  fontSize: 14,
  overflow: 'auto',
});

export default function Transactions() {
  const coreConnected = useSelector(isCoreConnected);
  const filteredTransactions = useSelector(
    ({
      ui: {
        transactions: { account, addressQuery, category, minAmount, timeSpan },
      },
      transactions: { map },
      settings: { devMode, fakeTransactions },
    }) => {
      const txList = getTransactionsList(map);
      const addFakeTxs = devMode && fakeTransactions;
      const allTransactions = addFakeTxs
        ? withFakeTxs(txList, state.myAccounts)
        : txList;

      return getFilteredTransactions(
        allTransactions,
        account,
        addressQuery,
        category,
        minAmount,
        timeSpan
      );
    }
  );
  const account = useSelector((state) => state.ui.transactions.account);
  const accountOptions = useSelector((state) =>
    getAccountOptions(state.myAccounts)
  );
  const settings = useSelector((state) => state.settings);
  const { minConfirmations } = settings;

  useEffect(() => {
    GA.SendScreen('Transactions');
  }, []);

  useEffect(() => {
    if (coreConnected && !filteredTransactions) {
      autoUpdateTransactions();
    }
  });

  return (
    <Panel
      icon={transactionIcon}
      title={__('Transaction details')}
      controls={
        <div className="flex center">
          <Tooltip.Trigger tooltip={__('Show transactions chart')}>
            <Button
              skin="plain"
              onClick={() => openModal(TransactionsChartModal)}
            >
              <Icon icon={barChartIcon} width={20} height={20} />
            </Button>
          </Tooltip.Trigger>

          <Tooltip.Trigger tooltip={__('Download transactions history')}>
            <Button
              skin="plain"
              onClick={() => {
                saveCSV(filteredTransactions);
                GA.SendEvent('Transaction', 'Data', 'Download CSV', 1);
              }}
            >
              <Icon icon={downloadIcon} />
            </Button>
          </Tooltip.Trigger>

          <AccountSelect
            value={account}
            onChange={setTxsAccountFilter}
            options={accountOptions}
          />
        </div>
      }
    >
      <RequireCoreConnected>
        {!filteredTransactions ? (
          <WaitingMessage>
            {__('Loading transactions')}
            ...
          </WaitingMessage>
        ) : (
          <TransactionsLayout>
            <Filters />
            <TransactionsTable
              data={filteredTransactions}
              columns={tableColumns}
              defaultPageSize={10}
              defaultSortingColumnIndex={0}
              getTrProps={(state, row) => {
                const tx = row && row.original;
                return {
                  onClick: tx
                    ? () => {
                        openModal(TransactionDetailsModal, {
                          txid: tx.txid,
                        });
                      }
                    : undefined,
                  style: tx
                    ? {
                        cursor: 'pointer',
                        opacity:
                          tx.category === 'immature' ||
                          tx.category === 'orphan' ||
                          isPending(tx, minConfirmations)
                            ? 0.5
                            : 1,
                      }
                    : undefined,
                };
              }}
            />
          </TransactionsLayout>
        )}
      </RequireCoreConnected>
    </Panel>
  );
}
