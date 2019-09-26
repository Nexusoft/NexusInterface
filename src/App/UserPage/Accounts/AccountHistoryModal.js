import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import WaitingMessage from 'components/WaitingMessage';
import Table from 'components/Table';
import ContractDetailsModal from 'components/ContractDetailsModal';
import FieldSet from 'components/FieldSet';
import { apiPost } from 'lib/tritiumApi';
import { formatDateTime, formatNumber } from 'lib/intl';
import { openModal } from 'actions/overlays';
import { handleError } from 'utils/form';

import { totalBalance } from './utils';

const displayedOperations = ['DEBIT', 'CREDIT', 'FEE', 'GENESIS', 'TRUST'];

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
    width: 200,
  },
  {
    id: 'operation',
    Header: __('Operation'),
    accessor: 'OP',
    width: 120,
  },
  {
    id: 'from',
    Header: __('From'),
    Cell: cell => {
      const { from_name, from, OP } = cell.original;
      const content = from_name || from || '';
      if (OP === 'DEBIT' || OP === 'FEE') {
        return <strong>{content}</strong>;
      } else {
        return content;
      }
    },
  },
  {
    id: 'to',
    Header: __('To'),
    Cell: cell => {
      const { to_name, to, OP } = cell.original;
      const content = to_name || to || '';
      if (OP === 'CREDIT') {
        return <strong>{content}</strong>;
      } else {
        return content;
      }
    },
  },
  {
    id: 'change',
    Header: __('Change'),
    Cell: ({ original: { OP, amount, token_name } }) =>
      amount ? (
        <Amount
          possitive={OP === 'CREDIT' || OP === 'GENESIS' || OP === 'TRUST'}
        >
          {formatNumber(amount)} {token_name}
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

class AccountHistoryModal extends React.Component {
  state = {
    contracts: null,
  };

  async componentDidMount() {
    const { account } = this.props;
    try {
      const limit = 100;
      let transactions = [];
      let page = 0;
      let results;
      do {
        results = await apiPost(
          account.token === '0'
            ? // A NXS account
              'finance/list/account/transactions'
            : // A token account
              'tokens/list/account/transactions',
          { page, limit, address: account.address, verbose: 'summary' }
        );
        transactions = [...transactions, ...results];
        page++;
      } while (results && results.length === limit);

      const contracts = transactions.reduce((contracts, tx) => {
        if (Array.isArray(tx.contracts)) {
          tx.contracts.forEach(contract => {
            if (displayedOperations.includes(contract.OP)) {
              contracts.push({
                ...contract,
                txid: tx.txid,
                timestamp: tx.timestamp,
              });
            }
          });
        }
        return contracts;
      }, []);
      this.setState({ contracts });
    } catch (err) {
      handleError(err);
      this.closeModal();
    }
  }

  render() {
    const { account, openModal } = this.props;
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
              <BalancesFieldSet legend={__('Account balance')}>
                <div className="flex space-between">
                  <div className="text-center">
                    <div>
                      <strong>{__('Total')}</strong>
                    </div>
                    <div>
                      {formatNumber(totalBalance(account))} {account.token_name}
                    </div>
                  </div>
                  <div className="text-center">
                    <div>
                      <strong>{__('Available')}</strong>
                    </div>
                    <div>
                      {formatNumber(account.balance)} {account.token_name}
                    </div>
                  </div>
                  <div className="text-center">
                    <div>
                      <strong>{__('Pending')}</strong>
                    </div>
                    <div>
                      {formatNumber(account.pending)} {account.token_name}
                    </div>
                  </div>
                  <div className="text-center">
                    <div>
                      <strong>{__('Unconfirmed')}</strong>
                    </div>
                    <div>
                      {formatNumber(account.unconfirmed)} {account.token_name}
                    </div>
                  </div>
                  {typeof account.stake === 'number' && (
                    <div className="text-center">
                      <div>
                        <strong>{__('Stake')}</strong>
                      </div>
                      <div>
                        {formatNumber(account.stake)} {account.token_name}
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
  stakeInfo: state.core.stakeInfo,
});

const actionCreators = {
  openModal,
};

export default connect(
  mapStateToProps,
  actionCreators
)(AccountHistoryModal);
