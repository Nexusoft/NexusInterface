import React, { Component } from 'react';
import { connect } from 'react-redux';
import GA from 'lib/googleAnalytics';
import styled from '@emotion/styled';

import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import Table from 'components/Table';
import LoginModal from 'components/LoginModal';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'actions/overlays';
import { isLoggedIn } from 'selectors';
import { fetchAllTransactions } from 'lib/tritiumTransactions';
import { observeStore } from 'store';

import { getContractList } from './selectors';

import transactionIcon from 'images/transaction.sprite.svg';

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
    accessor: 'txInfo.timestamp',
    Cell: cell => formatDateTime(cell.value * 1000, timeFormatOptions),
    width: 220,
  },
  {
    id: 'type',
    Header: __('Type'),
    accessor: 'OP',
    // Cell: cell => <CategoryCell transaction={cell.original} />,
    width: 120,
  },
  {
    id: 'amount',
    Header: __('Amount'),
    accessor: 'amount',
    width: 150,
  },
  {
    id: 'token_name',
    Header: __('Token'),
    accessor: 'token_name',
    width: 100,
  },
  {
    id: 'from',
    Header: __('From'),
    Cell: cell => cell.original.from_name || cell.original.from || '',
  },
  {
    id: 'to',
    Header: __('To'),
    Cell: cell =>
      cell.original.to_name ||
      cell.original.account_name ||
      cell.original.to ||
      cell.original.account ||
      '',
  },
];

const TransactionsLayout = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"table"',
  gridTemplateRows: '1fr',
});

const TransactionsTable = styled(Table)({
  gridArea: 'table',
  fontSize: 14,
  overflow: 'auto',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  const {
    core: {
      transactions: { map, loadedAll },
    },
    settings: { minConfirmations },
  } = state;
  return {
    loggedIn: isLoggedIn(state),
    contracts: getContractList(map),
    minConfirmations,
    loadedAll,
  };
};
const actionCreators = {
  openModal,
};

/**
 * TransactionsTritium Page
 *
 * @class TransactionsTritium
 * @extends {Component}
 */
class TransactionsTritium extends Component {
  /**
   * Component Mount Callback
   *
   * @memberof TransactionsTritium
   */
  componentDidMount() {
    GA.SendScreen('TransactionsTritium');
    if (!this.props.loadedAll) {
      if (this.props.loggedIn) {
        fetchAllTransactions();
      } else {
        this.unobserve = observeStore(isLoggedIn, loggedIn => {
          if (loggedIn) {
            fetchAllTransactions();
          }
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.unobserve) {
      this.unobserve();
    }
  }

  /**
   * React Render
   *
   * @returns JSX for Element
   * @memberof Transactions
   */
  render() {
    const {
      loadedAll,
      contracts,
      openModal,
      minConfirmations,
      loggedIn,
    } = this.props;

    return (
      <Panel icon={transactionIcon} title={__('Transactions')}>
        {!loggedIn ? (
          <div style={{ marginTop: 50, textAlign: 'center' }}>
            <Button
              uppercase
              skin="primary"
              onClick={() => {
                openModal(LoginModal);
              }}
            >
              {__('Log in')}
            </Button>
          </div>
        ) : !loadedAll ? (
          <WaitingMessage>
            {__('Loading transactions')}
            ...
          </WaitingMessage>
        ) : (
          <TransactionsLayout>
            <TransactionsTable
              data={contracts}
              columns={tableColumns}
              defaultPageSize={10}
              defaultSorted={[{ id: 'time', desc: true }]}
              getTrProps={(state, row) => {
                const contract = row && row.original;
                return {
                  // onClick: contract
                  //   ? () => {
                  //       openModal(TransactionDetailsModal, {
                  //         txid: contract.txid,
                  //       });
                  //     }
                  //   : undefined,
                  // style: contract
                  //   ? {
                  //       cursor: 'pointer',
                  //       opacity:
                  //         contract.category === 'immature' ||
                  //         contract.category === 'orphan' ||
                  //         isPending(contract, minConfirmations)
                  //           ? 0.5
                  //           : 1,
                  //     }
                  //   : undefined,
                };
              }}
            />
          </TransactionsLayout>
        )}
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  actionCreators
)(TransactionsTritium);
