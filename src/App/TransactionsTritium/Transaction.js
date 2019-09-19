import React from 'react';
import styled from '@emotion/styled';

import { formatDateTime } from 'lib/intl';
import * as color from 'utils/color';
import { timing } from 'styles';

import Contract from './Contract';

const dayFormat = { day: '2-digit' };
const monthFormat = { month: 'short' };
const yearFormat = { year: 'numeric' };

const TransactionComponent = styled.div(({ theme }) => ({
  margin: '10px 0',
  color: theme.mixer(0.75),
  background: color.darken(theme.background, 0.1),
  boxShadow: '0 0 5px 0 rgba(0,0,0,.5)',
  display: 'flex',
  alignItems: 'stretch',
}));

const TransactionLeft = styled.div(({ theme }) => ({
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  color: theme.foreground,
  borderRight: `1px solid ${color.fade(theme.primary, 0.5)}`,
  padding: '10px 24px',
  cursor: 'pointer',
  transition: `background ${timing.normal}`,
  '&:hover': {
    background: color.lighten(theme.background, 0.2),
  },
}));

const TransactionDate = styled.div(({ theme }) => ({
  textAlign: 'center',
  paddingTop: 18,
  position: 'relative',
}));

const Day = styled.div({
  fontSize: 22,
  lineHeight: 1,
});

const Month = styled.div({
  fontSize: 14,
});

const Year = styled.div({
  letterSpacing: 0.5,
  fontSize: 12,
  opacity: 0,
  transition: `opacity ${timing.normal}`,
  [`${TransactionLeft}:hover &`]: {
    opacity: 1,
  },
});

const TransactionRight = styled.div({
  flexBasis: 0,
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const Transaction = ({ transaction }) => {
  const txTime = new Date(transaction.timestamp * 1000);

  return (
    <TransactionComponent>
      <TransactionLeft>
        <TransactionDate>
          <Day>{formatDateTime(txTime, dayFormat)}</Day>
          <Month>{formatDateTime(txTime, monthFormat)}</Month>
          <Year>{formatDateTime(txTime, yearFormat)}</Year>
        </TransactionDate>
      </TransactionLeft>
      <TransactionRight>
        {transaction.contracts &&
          transaction.contracts.map((contract, i) => (
            <Contract key={i} contract={contract} />
          ))}
      </TransactionRight>
    </TransactionComponent>
  );
};

export default Transaction;
