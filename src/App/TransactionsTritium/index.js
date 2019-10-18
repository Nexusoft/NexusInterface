import React, { Component } from 'react';
import { connect } from 'react-redux';
import GA from 'lib/googleAnalytics';
import styled from '@emotion/styled';

import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import LoginModal from 'components/LoginModal';
import TextField from 'components/TextField';
import { openModal } from 'lib/ui';
import { isLoggedIn } from 'selectors';
import { fetchAllTransactions } from 'lib/tritiumTransactions';
import { observeStore } from 'store';
import { goToTxsPage } from 'lib/ui';

import {
  getTransactionsList,
  getFilteredTransactions,
  paginateTransactions,
  txPerPage,
} from './selectors';
import Transaction from './Transaction';

import transactionIcon from 'icons/transaction.svg';

const PageLayout = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  gridTemplateAreas: '"list" "pagination"',
  gridTemplateRows: '1fr min-content',
});

const TransactionsList = styled.div({
  gridArea: 'list',
  overflowY: 'auto',
  padding: '20px 30px',
});

const Pagination = styled.div({
  gridArea: 'pagination',
  padding: '10px 0',
  fontSize: '.9em',
});

const Container = styled.div({
  maxWidth: 650,
  margin: '0 auto',
});

const PageInput = styled(TextField)({
  width: 40,
  '& > input': {
    textAlign: 'center',
  },
});

const PaginationButton = styled(Button)({
  minWidth: 150,
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  const {
    core: {
      transactions: { map, loadedAll },
    },
    ui: {
      transactionsTritium: { page },
    },
    settings: { minConfirmations },
  } = state;
  const filteredTransactions = getFilteredTransactions(
    getTransactionsList(map)
  );
  return {
    loggedIn: isLoggedIn(state),
    transactions: paginateTransactions(filteredTransactions, page),
    minConfirmations,
    loadedAll,
    page,
    totalPages: Math.ceil(filteredTransactions.length / txPerPage),
  };
};

/**
 * TransactionsTritium Page
 *
 * @class TransactionsTritium
 * @extends {Component}
 */
class TransactionsTritium extends Component {
  pageRef = React.createRef();

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
    const { loadedAll, transactions, loggedIn, page, totalPages } = this.props;

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
          <PageLayout>
            <TransactionsList>
              <Container>
                {transactions &&
                  transactions.map(tx => (
                    <Transaction key={tx.txid} transaction={tx} />
                  ))}
              </Container>
            </TransactionsList>
            <Pagination>
              <Container className="flex center space-between">
                <PaginationButton
                  skin="filled-inverted"
                  disabled={page <= 1}
                  onClick={
                    page > 1
                      ? () => {
                          goToTxsPage(page - 1);
                        }
                      : undefined
                  }
                >
                  &lt; {__('Previous')}
                </PaginationButton>

                <div className="flex center">
                  {__(
                    'Page <page></page> of %{total}',
                    {
                      total: totalPages,
                    },
                    {
                      page: () => (
                        <>
                          &nbsp;
                          <PageInput
                            inputRef={this.pageRef}
                            type="number"
                            min={1}
                            max={totalPages}
                            value={page}
                            onChange={e => {
                              goToTxsPage(e.target.current.value);
                            }}
                          />
                          &nbsp;
                        </>
                      ),
                    }
                  )}
                </div>

                <PaginationButton
                  skin="filled-inverted"
                  disabled={page >= totalPages}
                  onClick={
                    page < totalPages
                      ? () => {
                          goToTxsPage(page + 1);
                        }
                      : undefined
                  }
                >
                  {__('Next')} &gt;
                </PaginationButton>
              </Container>
            </Pagination>
          </PageLayout>
        )}
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(mapStateToProps)(TransactionsTritium);
