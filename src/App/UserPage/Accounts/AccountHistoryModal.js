import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import WaitingMessage from 'components/WaitingMessage';
import Table from 'components/Table';
import ContractDetailsModal from 'components/ContractDetailsModal';
import FieldSet from 'components/FieldSet';
import listAll from 'utils/listAll';
import { formatDateTime, formatNumber, formatCurrency } from 'lib/intl';
import { openModal, toggleUserBalanceDisplayFiat } from 'lib/ui';
import { handleError } from 'utils/form';

import { totalBalance } from './utils';
import Link from 'components/Link';
import Tooltip from 'components/Tooltip';

__ = __context('User.Accounts.AccountHistory');

const displayedOperations = [
  'DEBIT',
  'CREDIT',
  'FEE',
  'GENESIS',
  'TRUST',
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

const tableColumns = [
  {
    id: 'timestamp',
    Header: __('Time'),
    accessor: 'timestamp',
    Cell: cell =>
      cell.value ? formatDateTime(cell.value * 1000, timeFormatOptions) : '',
    width: 180,
  },
  {
    id: 'operation',
    Header: __('Operation'),
    accessor: 'OP',
    width: 105,
  },
  {
    id: 'from',
    Header: __('From'),
    Cell: cell => {
      const {
        original: { from_name, from, trustkey, OP },
      } = cell;
      const content = from_name || from || '';
      switch (OP) {
        case 'DEBIT':
        case 'FEE':
          return <span className="dim">{content}</span>;
        case 'TRUST':
        case 'GENESIS':
          return <i className="dim">{__('staked')}</i>;
        case 'CREDIT':
          if (cell.original.for === 'COINBASE') {
            return <i className="dim">{__('mined')}</i>;
          }
        case 'MIGRATE':
          return trustkey || '';
        default:
          return content;
      }
    },
  },
  {
    id: 'to',
    Header: __('To'),
    Cell: cell => {
      const {
        original: { to_name, to, account_name, account, OP, currentAccount },
      } = cell;
      const content = to_name || to || '';
      switch (OP) {
        case 'CREDIT':
          if (cell.original.for === 'COINBASE') {
            return <span className="dim">{currentAccount}</span>;
          }
          return <span className="dim">{content}</span>;
        case 'TRUST':
        case 'GENESIS':
          return <span className="dim">{currentAccount}</span>;
        case 'MIGRATE':
          return <span className="dim">{account_name || account || ''}</span>;
        default:
          return content;
      }
    },
  },
  {
    id: 'change',
    Header: __('Change'),
    Cell: ({ original: { OP, amount } }) =>
      amount ? (
        <Amount
          possitive={
            OP === 'CREDIT' ||
            OP === 'GENESIS' ||
            OP === 'TRUST' ||
            OP === 'COINBASE' ||
            OP === 'MIGRATE' ||
            OP === 'LEGACY'
          }
        >
          {formatNumber(amount, 6)}
        </Amount>
      ) : (
        ''
      ),
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
@connect(state => ({
  showFiat: state.ui.user.balancesShowFiat,
  fiatCurrency: state.settings.fiatCurrency,
  market:
    state.market.cryptocompare.rawNXSvalues &&
    state.market.cryptocompare.rawNXSvalues.find(
      e => e.name === state.settings.fiatCurrency
    ).price,
}))
class AccountHistoryModal extends React.Component {
  state = {
    contracts: null,
  };

  async componentDidMount() {
    const { account } = this.props;
    try {
      const transactions = await listAll(
        account.token === '0'
          ? // A NXS account
            'finance/list/account/transactions'
          : // A token account
            'tokens/list/account/transactions',
        { address: account.address, verbose: 'summary' }
      );

      const contracts = transactions.reduce((contracts, tx) => {
        if (Array.isArray(tx.contracts)) {
          tx.contracts.forEach(contract => {
            if (displayedOperations.includes(contract.OP)) {
              contracts.push({
                ...contract,
                txid: tx.txid,
                timestamp: tx.timestamp,
                currentAccount: account.name,
              });
            }
          });
        }
        return contracts.sort((c1, c2) => c1.timestamp - c2.timestamp);
      }, []);
      this.setState({ contracts });
    } catch (err) {
      handleError(err);
      this.closeModal();
    }
  }

  render() {
    const { account, balances, showFiat, market, fiatCurrency } = this.props;
    const { contracts } = this.state;
    return (
      <Modal
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
      >
        <Modal.Header>
          {account.name} {__('Account History')}
        </Modal.Header>
        <Modal.Body>
          {!contracts ? (
            <WaitingMessage>
              {__('Loading account history')}
              ...
            </WaitingMessage>
          ) : (
            <Layout>
              <BalancesFieldSet
                legend={
                  account.token_name === 'NXS' ? (
                    <>
                      {__('Account balance(')}
                      <Tooltip.Trigger
                        tooltip={__('Show %{tokenName}', {
                          tokenName: showFiat ? 'NXS' : 'Fiat',
                        })}
                        position="top"
                      >
                        <Link
                          as={''}
                          to={''}
                          onClick={e =>
                            toggleUserBalanceDisplayFiat(!this.props.showFiat)
                          }
                        >
                          {showFiat ? fiatCurrency : 'NXS'}
                        </Link>
                      </Tooltip.Trigger>
                      {')'}
                    </>
                  ) : (
                    `${__('Account balance')} (${account.token_name})`
                  )
                }
              >
                <div className="flex space-between">
                  <div className="text-center">
                    <div>
                      <strong>{__('Total')}</strong>
                    </div>
                    <div>
                      {showFiat && account.token_name === 'NXS'
                        ? formatCurrency(
                            totalBalance(account, 6) * market,
                            fiatCurrency
                          )
                        : formatNumber(totalBalance(account, 6))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div>
                      <strong>{__('Available')}</strong>
                    </div>
                    <div>
                      {showFiat && account.token_name === 'NXS'
                        ? formatCurrency(account.balance * market, fiatCurrency)
                        : formatNumber(account.balance, 6)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div>
                      <strong>{__('Pending')}</strong>
                    </div>
                    <div>
                      {showFiat && account.token_name === 'NXS'
                        ? formatCurrency(account.pending * market, fiatCurrency)
                        : formatNumber(account.pending, 6)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div>
                      <strong>{__('Unconfirmed')}</strong>
                    </div>
                    <div>
                      {showFiat && account.token_name === 'NXS'
                        ? formatCurrency(
                            account.unconfirmed * market,
                            fiatCurrency
                          )
                        : formatNumber(account.unconfirmed, 6)}
                    </div>
                  </div>
                  {typeof account.stake === 'number' && (
                    <div className="text-center">
                      <div>
                        <strong>{__('Stake')}</strong>
                      </div>
                      <div>
                        {showFiat && account.token_name === 'NXS'
                          ? formatCurrency(account.stake * market, fiatCurrency)
                          : formatNumber(account.stake, 6)}
                      </div>
                    </div>
                  )}
                </div>
              </BalancesFieldSet>

              <ContractsTable
                data={contracts}
                columns={tableColumns}
                defaultPageSize={10}
                getTrProps={(state, row) => {
                  const contract = row && row.original;
                  return {
                    onClick: contract
                      ? () => {
                          openModal(ContractDetailsModal, {
                            contract,
                            txid: contract.txid,
                          });
                        }
                      : undefined,
                    style: {
                      cursor: 'pointer',
                      fontSize: 15,
                    },
                  };
                }}
              />
            </Layout>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  stakeInfo: state.user.stakeInfo,
});

export default connect(mapStateToProps)(AccountHistoryModal);
