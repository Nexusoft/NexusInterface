import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';

import ControlledModal from 'components/ControlledModal';
import WaitingMessage from 'components/WaitingMessage';
import Table from 'components/Table';
import ContractDetailsModal from 'components/ContractDetailsModal';
import FieldSet from 'components/FieldSet';
import Link from 'components/Link';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import listAll from 'utils/listAll';
import { formatDateTime, formatNumber, formatCurrency } from 'lib/intl';
import { openModal, toggleUserBalanceDisplayFiat } from 'lib/ui';
import { marketDataQuery } from 'lib/market';
import { lookupAddress } from 'lib/addressBook';
import TokenName from 'components/TokenName';
import { handleError } from 'utils/form';
import contactIcon from 'icons/address-book.svg';

import { totalBalance } from './utils';

__ = __context('User.Accounts.AccountHistory');

const displayedOperations = [
  'DEBIT',
  'CREDIT',
  'FEE',
  'GENESIS',
  'TRUST',
  'GENESISPOOL',
  'TRUSTPOOL',
  'COINBASE',
  'MIGRATE',
  'LEGACY',
];

const timeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

const accountDisplay = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  const { name, address, namespace } = value;
  if (name) {
    const nameDisplay = namespace ? namespace + '::' + name : name;
    return (
      <Tooltip.Trigger tooltip={nameDisplay}>
        <span>{nameDisplay}</span>
      </Tooltip.Trigger>
    );
  }

  if (address) {
    const match = lookupAddress(address);
    if (match) {
      const contactDisplay =
        match.name + (match.label ? ' - ' + match.label : '');

      return (
        <Tooltip.Trigger tooltip={contactDisplay}>
          <span>
            <Icon icon={contactIcon} className="mr0_4" />
            <span className="v-align">{contactDisplay}</span>
          </span>
        </Tooltip.Trigger>
      );
    } else {
      return (
        <Tooltip.Trigger tooltip={address}>
          <span className="monospace">{address}</span>
        </Tooltip.Trigger>
      );
    }
  }

  return '';
};

const positiveAmountOPs = [
  'CREDIT',
  'GENESIS',
  'TRUST',
  'GENESISPOOL',
  'TRUSTPOOL',
  'COINBASE',
  'MIGRATE',
];

const defaultColumn = {
  size: 100,
};

const columns = [
  {
    id: 'timestamp',
    header: __('Time'),
    accessorKey: 'timestamp',
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? formatDateTime(value * 1000, timeFormatOptions) : '';
    },
    size: 180,
    sortingFn: 'datetime',
  },
  {
    id: 'operation',
    header: __('Operation'),
    accessorKey: 'OP',
    size: 105,
    sortingFn: 'text',
  },
  {
    id: 'from',
    header: __('From'),
    accessorKey: 'from',
    cell: ({ row }) => {
      const {
        original: { from, trustkey, OP },
      } = row;
      const content = accountDisplay(from);
      switch (OP) {
        case 'DEBIT':
        case 'FEE':
        case 'LEGACY':
          return <span className="dim">{content}</span>;
        case 'TRUST':
        case 'GENESIS':
        case 'TRUSTPOOL':
        case 'GENESISPOOL':
          return <i className="dim">{__('staking')}</i>;
        case 'CREDIT':
          if (row.original.for === 'COINBASE') {
            return <i className="dim">{__('mining')}</i>;
          } else if (row.original.for === 'LEGACY') {
            return <i className="dim">LEGACY</i>;
          } else {
            return content;
          }
        case 'MIGRATE':
          return trustkey || '';
        default:
          return content;
      }
    },
    sortingFn: 'alphanumericCaseSensitive',
    sortDescFirst: false,
  },
  {
    id: 'to',
    header: __('To'),
    accessorKey: 'to',
    cell: ({ row }) => {
      const {
        original: { to, name, address, OP },
      } = row;
      const content = accountDisplay(to);
      switch (OP) {
        case 'CREDIT':
          return <span className="dim">{content}</span>;
        case 'TRUST':
        case 'GENESIS':
        case 'TRUSTPOOL':
        case 'GENESISPOOL':
        case 'MIGRATE':
          return <span className="dim">{name || address || ''}</span>;
        default:
          return content;
      }
    },
    sortingFn: 'alphanumericCaseSensitive',
    sortDescFirst: false,
  },
  {
    id: 'change',
    accessorFn: (contract) => {
      const amount = contract.amount || 0;
      const positive = positiveAmountOPs.includes(contract.OP);
      return positive ? amount : -amount;
    },
    header: __('Change'),
    cell: ({ row }) => {
      const {
        original: { OP, amount },
      } = row;
      return amount ? (
        <Amount possitive={positiveAmountOPs.includes(OP)}>
          {formatNumber(amount, 6)}
        </Amount>
      ) : (
        ''
      );
    },
    sortingFn: 'basic',
  },
];

const Layout = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"balances" "table"',
  gridTemplateRows: 'min-content 1fr',
  rowGap: '1em',
});

const BalancesFieldSet = styled(FieldSet)({
  gridArea: 'balances',
  margin: 0,
  fontSize: 15,
});

const ContractsTable = styled(Table)(({ theme }) => ({
  gridArea: 'table',
  color: theme.foreground,
  overflow: 'auto',
}));

const Amount = styled.span(({ theme, possitive }) => ({
  fontWeight: 'bold',
  color: possitive ? theme.primary : theme.danger,
  '&::before': {
    content: possitive ? '"+"' : '"-"',
  },
}));

export default function AccountHistoryModal({ account }) {
  const [contracts, setContracts] = useState(null);
  const showFiat = useSelector((state) => state.ui.user.balancesShowFiat);
  const marketData = marketDataQuery.use();
  const { price, currency } = marketData || {};
  const closeModalRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const transactions = await listAll('finance/transactions/any', {
          address: account.address,
          verbose: 'summary',
        });

        const contracts = transactions.reduce((contracts, tx) => {
          if (Array.isArray(tx.contracts)) {
            tx.contracts.forEach((contract) => {
              if (displayedOperations.includes(contract.OP)) {
                contracts.push({
                  ...contract,
                  txid: tx.txid,
                  timestamp: tx.timestamp,
                });
              }
            });
          }
          return contracts.sort((c1, c2) => c2.timestamp - c1.timestamp);
        }, []);
        setContracts(contracts);
      } catch (err) {
        handleError(err);
        closeModalRef.current?.();
      }
    })();
  }, []);

  return (
    <ControlledModal
      assignClose={(closeModal) => {
        closeModalRef.current = closeModal;
      }}
      style={{ width: '80%' }}
    >
      <ControlledModal.Header>
        {account.name} {__('Account History')}
      </ControlledModal.Header>
      <ControlledModal.Body>
        {!contracts ? (
          <WaitingMessage>
            {__('Loading account history')}
            ...
          </WaitingMessage>
        ) : (
          <Layout>
            <BalancesFieldSet
              legend={
                account.token === '0' ? (
                  <>
                    {__('Account balance')} (
                    <Tooltip.Trigger
                      tooltip={__('Show %{tokenName}', {
                        tokenName: showFiat ? 'NXS' : 'Fiat',
                      })}
                      position="top"
                    >
                      <Link
                        as={''}
                        to={''}
                        onClick={(e) => toggleUserBalanceDisplayFiat(!showFiat)}
                      >
                        {showFiat ? currency : 'NXS'}
                      </Link>
                    </Tooltip.Trigger>
                    )
                  </>
                ) : (
                  <span>
                    {__('Account balance')} (
                    <TokenName account={account} />)
                  </span>
                )
              }
            >
              <div className="flex space-between">
                <div className="text-center">
                  <div>
                    <strong>{__('Total')}</strong>
                  </div>
                  <div>
                    {showFiat && account.ticker === '0'
                      ? formatCurrency(
                          totalBalance(account, 6) * price,
                          currency
                        )
                      : formatNumber(totalBalance(account, 6))}
                  </div>
                </div>
                <div className="text-center">
                  <div>
                    <strong>{__('Available')}</strong>
                  </div>
                  <div>
                    {showFiat && account.ticker === '0'
                      ? formatCurrency(account.balance * price, currency)
                      : formatNumber(account.balance, 6)}
                  </div>
                </div>
                <div className="text-center">
                  <div>
                    <strong>{__('Unclaimed')}</strong>
                  </div>
                  <div>
                    {showFiat && account.ticker === '0'
                      ? formatCurrency(
                          (account.unclaimed || 0) * price,
                          currency
                        )
                      : formatNumber(account.unclaimed || 0, 6)}
                  </div>
                </div>
                <div className="text-center">
                  <div>
                    <strong>{__('Unconfirmed')}</strong>
                  </div>
                  <div>
                    {showFiat && account.ticker === '0'
                      ? formatCurrency(
                          (account.unconfirmed || 0) * price,
                          currency
                        )
                      : formatNumber(account.unconfirmed || 0, 6)}
                  </div>
                </div>
                {typeof account.stake === 'number' && (
                  <div className="text-center">
                    <div>
                      <strong>{__('Stake')}</strong>
                    </div>
                    <div>
                      {showFiat && account.ticker === '0'
                        ? formatCurrency(account.stake * price, currency)
                        : formatNumber(account.stake, 6)}
                    </div>
                  </div>
                )}
              </div>
            </BalancesFieldSet>

            <ContractsTable
              data={contracts}
              defaultColumn={defaultColumn}
              columns={columns}
              defaultPageSize={10}
              onRowClick={(row) => {
                const contract = row?.original;
                openModal(ContractDetailsModal, {
                  contract,
                  txid: contract?.txid,
                });
              }}
            />
          </Layout>
        )}
      </ControlledModal.Body>
    </ControlledModal>
  );
}
