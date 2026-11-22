import styled from '@emotion/styled';

import { formatDateTime } from 'lib/intl';
import { popupContextMenu } from 'lib/contextMenu';
import * as color from 'utils/color';
import { timing } from 'styles';
import { openModal } from 'lib/ui';

import TransactionDetailsModal from 'components/TransactionDetailsModal';
import Contract from './Contract';

__ = __context('Transactions');

const dateFormat = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};
const timeFormat = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};
const dayFormat = { day: '2-digit' };
const monthFormat = { month: 'short' };

const TransactionComponent = styled.div(
  ({ theme }) => ({
    margin: '10px 0',
    color: theme.mixer(0.75),
    background: theme.lower(theme.background, 0.1),
    boxShadow: '0 0 5px 0 rgba(0,0,0,.5)',
    display: 'flex',
    alignItems: 'stretch',
    ...(theme.modern && {
      margin: '0 0 12px', borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${color.fade(theme.primary, 0.82)}`,
      background: 'linear-gradient(120deg, #1b292f, #1c1e20)',
      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
    }),
  }),
  ({ unconfirmed }) =>
    unconfirmed && {
      opacity: 0.5,
    }
);

const TransactionLeft = styled.div(({ theme }) => ({
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  color: theme.foreground,
  borderRight: `1px solid ${color.fade(theme.primary, 0.5)}`,
  cursor: 'pointer',
  transition: `background ${timing.normal}`,
  '&:hover': {
    background: color.lighten(theme.lower(theme.background, 0.1), 0.2),
  },
  ...(theme.modern && { borderRight: `1px solid ${color.fade(theme.primary, 0.85)}` }),
}));

const TransactionDate = styled.div({
  textAlign: 'center',
  padding: '12px',
  position: 'relative',
});

const FullDateTime = styled.div({
  fontSize: 14,
});

const ShortDate = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: theme.lower(theme.background, 0.1),
  ...(theme.modern && { background: '#1b2b31', color: theme.primary }),
  transition: `opacity ${timing.normal}`,

  [`${TransactionLeft}:hover &`]: {
    opacity: 0,
  },
}));

const Day = styled.div({
  fontSize: 22,
  lineHeight: 1.2,
});

const Month = styled.div({
  fontSize: 14,
});

const TransactionRight = styled.div({
  flexBasis: 0,
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}, ({ theme }) => theme.modern && ({ minWidth: 0 }));

export default function Transaction({ transaction }) {
  const txTime = new Date(transaction.timestamp * 1000);

  return (
    <TransactionComponent unconfirmed={!(transaction.confirmations > 0)}>
      <TransactionLeft
        onClick={() =>
          openModal(TransactionDetailsModal, { txid: transaction.txid })
        }
        onContextMenu={(e) => {
          e.stopPropagation();
          popupContextMenu([
            {
              id: 'tx-details',
              label: __('View transaction details'),
              click: () => {
                openModal(TransactionDetailsModal, { txid: transaction.txid });
              },
            },
          ]);
        }}
      >
        <TransactionDate>
          <FullDateTime>
            <div>{formatDateTime(txTime, dateFormat)}</div>
            <div style={{ letterSpacing: 1.5 }}>
              {formatDateTime(txTime, timeFormat)}
            </div>
          </FullDateTime>
          <ShortDate>
            <div>
              <Day>{formatDateTime(txTime, dayFormat)}</Day>
              <Month>{formatDateTime(txTime, monthFormat)}</Month>
            </div>
          </ShortDate>
        </TransactionDate>
      </TransactionLeft>
      <TransactionRight>
        {transaction.contracts &&
          transaction.contracts.map((contract, i) => (
            <Contract key={i} contract={contract} txid={transaction.txid} />
          ))}
      </TransactionRight>
    </TransactionComponent>
  );
}
