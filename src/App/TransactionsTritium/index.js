import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import GA from 'lib/googleAnalytics';
import styled from '@emotion/styled';

import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import TextField from 'components/TextField';
import RequireLoggedIn from 'components/RequireLoggedIn';
import Spinner from 'components/Spinner';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { isLoggedIn } from 'selectors';
import { fetchAllTransactions } from 'lib/tritiumTransactions';
import { observeStore } from 'store';
import { goToTxsPage } from 'lib/ui';
import transactionIcon from 'icons/transaction.svg';
import warningIcon from 'icons/warning.svg';

import {
  getTransactionsList,
  getFilteredTransactions,
  paginateTransactions,
  txPerPage,
} from './selectors';
import Transaction from './Transaction';
import Balances from './Balances';
import Filters from './Filters';

__ = __context('Transactions');

const PageLayout = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  gridTemplateAreas: '"balances filters" "balances list" "balances pagination"',
  gridTemplateRows: 'min-content 1fr min-content',
  gridTemplateColumns: '1fr 2.7fr',
});

const TransactionsList = styled.div({
  gridArea: 'list',
  overflowY: 'auto',
  padding: '0 20px',
});

const Pagination = styled.div(({ morePadding }) => ({
  gridArea: 'pagination',
  fontSize: '.9em',
  padding: `10px ${morePadding ? '26px' : '20px'} 20px 20px`,
}));

const Container = styled.div({
  position: 'relative',
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

const TransactionLoadingWarningSpinner = styled(Spinner)(({ theme }) => ({
  color: theme.danger,
  width: '2em',
  height: '2em',
}));

const TransactionLoadingWarningIcon = styled(Icon)(({ theme }) => ({
  color: theme.danger,
  position: 'absolute',
  marginTop: '.4em',
  marginLeft: '-1.5em',
}));

// React-Redux mandatory methods
const mapStateToProps = (state) => {
  const {
    user: {
      transactions: { map, loadedAll },
    },
    ui: {
      transactionsTritium: {
        page,
        addressQuery,
        operation,
        nameQuery,
        timeSpan,
      },
    },
  } = state;
  const transactionList = getTransactionsList(map);
  const filteredTransactions = getFilteredTransactions(
    transactionList,
    nameQuery,
    addressQuery,
    operation,
    timeSpan
  );
  return {
    transactions: paginateTransactions(filteredTransactions, page),
    loadedAll,
    loadedSome: !!transactionList.length,
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
  listRef = createRef();

  state = {
    // Whether transaction list is having a scrollbar
    hasScroll: false,
  };

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
        this.unobserve = observeStore(
          (state) => state.user.status,
          (status, oldStatus) => {
            if (
              (!oldStatus && status) ||
              status?.genesis !== oldStatus?.genesis
            ) {
              fetchAllTransactions();
            }
          }
        );
      }
    }

    this.checkScrollbar();
  }

  componentWillUnmount() {
    if (this.unobserve) {
      this.unobserve();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.transactions !== this.props.transaction) {
      this.checkScrollbar();
    }
  }

  // When transactions list has a scrollbar, the alignment of elements
  // will be affected, so set a state to adjust the paddings accordingly
  checkScrollbar = () => {
    const listEl = this.listRef.current;
    if (listEl) {
      // If transactions list has a scrollbar
      if (listEl.clientHeight < listEl.scrollHeight && !this.state.hasScroll) {
        this.setState({ hasScroll: true });
      }
      if (listEl.clientHeight >= listEl.scrollHeight && this.state.hasScroll) {
        this.setState({ hasScroll: false });
      }
    }
  };

  /**
   * React Render
   *
   * @returns JSX for Element
   * @memberof Transactions
   */
  render() {
    const {
      loadedAll,
      loadedSome,
      transactions,
      page,
      totalPages,
    } = this.props;
    return (
      <Panel icon={transactionIcon} title={__('Transactions')}>
        <RequireLoggedIn>
          {!loadedSome ? (
            <WaitingMessage>{__('Loading transactions...')}</WaitingMessage>
          ) : (
            <PageLayout>
              <Balances />
              <Filters morePadding={this.state.hasScroll} />
              <TransactionsList ref={this.listRef}>
                <Container>
                  {transactions &&
                    transactions.map((tx) => (
                      <Transaction key={tx.txid} transaction={tx} />
                    ))}
                </Container>
              </TransactionsList>
              <Pagination morePadding={this.state.hasScroll}>
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
                              type="number"
                              min={1}
                              max={totalPages}
                              value={page}
                              onChange={(e) => {
                                goToTxsPage(e.target.value);
                              }}
                            />
                            &nbsp;
                          </>
                        ),
                      }
                    )}
                  </div>
                  {!loadedAll ? (
                    <Tooltip.Trigger
                      position="top"
                      tooltip={__('Loading transactions...')}
                    >
                      <div style={{ position: 'absolute', right: '30%' }}>
                        <TransactionLoadingWarningSpinner />
                        <TransactionLoadingWarningIcon icon={warningIcon} />
                      </div>
                    </Tooltip.Trigger>
                  ) : null}
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
        </RequireLoggedIn>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(mapStateToProps)(TransactionsTritium);
