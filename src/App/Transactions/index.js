import { moduleLayout, modulePanel } from 'utils/moduleStyles';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import UT from 'lib/usageTracking';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';
import GridTracers, { modernGridBackground } from 'components/GridTracers';

import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import TextField from 'components/TextField';
import RequireLoggedIn from 'components/RequireLoggedIn';
import Spinner from 'components/Spinner';
import Icon from 'components/Icon';
import { loadTransactions, updatePage } from 'lib/transactions';
import transactionIcon from 'icons/transaction.svg';
import warningIcon from 'icons/warning.svg';

import Transaction from './Transaction';
import Balances from './Balances';
import Filters from './Filters';
import ModernHistory from './ModernHistory';

__ = __context('Transactions');

const ModernPage = styled.section(({ theme }) => ({
  position: 'relative', width: '100%', height: '100%', minWidth: 0,
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  color: theme.foreground, ...modernGridBackground(theme),
}));

const Body = styled.div({
  position: 'relative', zIndex: 1, flex: 1, minHeight: 0, display: 'flex',
  flexDirection: 'column', padding: moduleLayout.pagePadding,
});

function TransactionsFrame({ children }) {
  const { modern } = useTheme();
  if (!modern) return <Panel icon={transactionIcon} title={__('Transactions')}>{children}</Panel>;
  return (
    <ModernPage>
      <GridTracers />
      <Body>{children}</Body>
    </ModernPage>
  );
}

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
}, ({ theme }) => theme.modern && ({
  position: 'relative', flex: 1, minHeight: 0, minWidth: 0,
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateAreas: '"balances" "history"',
  gridTemplateRows: 'auto minmax(260px, 1fr)', gap: 14, overflowY: 'auto',
}));

const HistoryPanel = styled.div(({ theme }) => theme.modern ? ({
  gridArea: 'history', display: 'flex', flexDirection: 'column',
  minWidth: 0, minHeight: 0, overflow: 'hidden', borderRadius: 16,
  ...modulePanel(theme),
}) : ({ display: 'contents' }));

const TransactionsList = styled.div({
  gridArea: 'list',
  overflowY: 'auto',
  padding: '0 20px',
}, ({ theme }) => theme.modern && ({
  padding: 12, flex: 1, minWidth: 0, minHeight: 0,
  '& > div > div:last-child': { marginBottom: 0 },
}));

const Pagination = styled.div(({ morePadding, theme }) => ({
  gridArea: 'pagination',
  fontSize: '.9em',
  padding: `10px ${morePadding ? '26px' : '20px'} 20px 20px`,
  ...(theme.modern && {
    padding: '12px 18px', flexShrink: 0,
    borderTop: `1px solid ${fade(theme.primary, 0.82)}`,
    '& > div': { gap: 12, flexWrap: 'wrap' },
  }),
}));

const Container = styled.div({
  position: 'relative',
  maxWidth: 650,
  margin: '0 auto',
}, ({ theme }) => theme.modern && ({ maxWidth: 'none' }));

const PageInput = styled(TextField)({
  width: 40,
  '& > input': {
    textAlign: 'center',
  },
});

const PaginationButton = styled(Button)({
  minWidth: 150,
}, ({ theme }) => theme.modern && ({ minWidth: 100, borderRadius: 10 }));

const TransactionLoadingWarningSpinner = styled(Spinner)(({ theme }) => ({
  color: theme.mixer(0.5),
  width: '1.4em',
  height: '1.4em',
  position: 'absolute',
  left: '100%',
  marginLeft: '1em',
}));

const ErrorMessage = styled.div(({ theme }) => ({
  textAlign: 'center',
  padding: '30px 0',
  color: theme.danger,
}));

// listRef = createRef();

// state = {
//   // Whether transaction list is having a scrollbar
//   hasScroll: false,
// };

// /**
//    * Component Mount Callback
//    *
//    * @memberof Transactions
//    */
//  componentDidMount() {

//   this.checkScrollbar();
// }

// componentDidUpdate(prevProps) {
//   if (prevProps.transactions !== this.props.transaction) {
//     this.checkScrollbar();
//   }
// }

// // When transactions list has a scrollbar, the alignment of elements
// // will be affected, so set a state to adjust the paddings accordingly
// checkScrollbar = () => {
//   const listEl = this.listRef.current;
//   if (listEl) {
//     // If transactions list has a scrollbar
//     if (listEl.clientHeight < listEl.scrollHeight && !this.state.hasScroll) {
//       this.setState({ hasScroll: true });
//     }
//     if (listEl.clientHeight >= listEl.scrollHeight && this.state.hasScroll) {
//       this.setState({ hasScroll: false });
//     }
//   }
// };

// const totalPages = 10;

/**
 * Transactions Page
 *
 * @class Transactions
 * @extends {Component}
 */
export default function Transactions() {
  const { modern } = useTheme();
  const { status, transactions, lastPage } = useSelector(
    (state) => state.user.transactions
  );
  const { page } = useSelector((state) => state.ui.transactionsFilter);
  const genesis = useSelector((state) => state.user.status?.genesis);

  useEffect(() => {
    UT.SendScreen('Transactions');
  }, []);
  // Reload transactions when user genesis changes, such as when user
  // is logged in or switched to another user
  useEffect(() => {
    if (genesis && (status === 'notLoaded' || status === 'error')) {
      loadTransactions();
    }
  }, [genesis]);

  return (
    <TransactionsFrame>
      <RequireLoggedIn>
        <PageLayout>
          <Balances />
          {modern ? <ModernHistory transactions={transactions} status={status} page={page} lastPage={lastPage} /> : <>
          <Filters /> {/*morePadding={this.state.hasScroll} */}
          <HistoryPanel>
          <TransactionsList>
            {' '}
            {/*ref={this.listRef} */}
            {status === 'loading' && (
              <WaitingMessage>{__('Loading transactions...')}</WaitingMessage>
            )}
            {status === 'error' && (
              <ErrorMessage>
                <div className="text-center">
                  <Icon icon={warningIcon} size={32} />
                </div>
                <div className="mt0_4">{__('Failed to load transactions')}</div>
              </ErrorMessage>
            )}
            {status === 'loaded' && (
              <Container>
                {transactions &&
                  transactions.map((tx) => (
                    <Transaction key={tx.txid} transaction={tx} />
                  ))}
              </Container>
            )}
          </TransactionsList>
          <Pagination>
            {' '}
            {/*morePadding={this.state.hasScroll}*/}
            <Container className="flex center space-between">
              <PaginationButton
                skin="filled-inverted"
                disabled={page <= 1}
                onClick={
                  page > 1
                    ? () => {
                        updatePage(page - 1);
                      }
                    : undefined
                }
              >
                &lt; {__('Previous')}
              </PaginationButton>
              <div className="flex center relative">
                {__(
                  'Page <page></page>',
                  // 'Page <page></page> of %{total}',
                  {
                    // total: totalPages,
                  },
                  {
                    page: () => (
                      <>
                        &nbsp;
                        <PageInput
                          type="number"
                          min={1}
                          // max={totalPages}
                          value={page}
                          onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page) {
                              updatePage(parseInt(e.target.value));
                            }
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
                // disabled={page >= totalPages}
                onClick={
                  // page < totalPages ?
                  () => {
                    updatePage(page + 1);
                  }
                  // : undefined
                }
              >
                {__('Next')} &gt;
              </PaginationButton>
            </Container>
          </Pagination>
          </HistoryPanel>
          </>}
        </PageLayout>
      </RequireLoggedIn>
    </TransactionsFrame>
  );
}
