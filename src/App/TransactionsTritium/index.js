import React, { Component } from 'react';
import { connect } from 'react-redux';
import GA from 'lib/googleAnalytics';
import styled from '@emotion/styled';

import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import LoginModal from 'components/LoginModal';
import { openModal } from 'lib/ui';
import { isLoggedIn } from 'selectors';
import { fetchAllTransactions } from 'lib/tritiumTransactions';
import { observeStore } from 'store';

import { getTransactionsList } from './selectors';
import Transaction from './Transaction';

import transactionIcon from 'images/transaction.sprite.svg';

const TransactionsLayout = styled.div({
  maxWidth: 650,
  margin: '0 auto',
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
    transactions: getTransactionsList(map),
    minConfirmations,
    loadedAll,
  };
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
    const { loadedAll, transactions, loggedIn } = this.props;

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
            {transactions &&
              transactions.map(tx => (
                <Transaction key={tx.txid} transaction={tx} />
              ))}
          </TransactionsLayout>
        )}
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(mapStateToProps)(TransactionsTritium);
