import React from 'react';
import styled from '@emotion/styled';

import { formatDateTime } from 'lib/intl';
import * as color from 'utils/color';

import Contract from './Contract';

const dayFormat = { day: '2-digit' };
const monthFormat = { month: 'short' };

const TransactionComponent = styled.div(({ theme }) => ({
  margin: '10px 0',
  color: theme.foreground,
  background: theme.background,
  boxShadow: '0 0 5px 0 rgba(0,0,0,.5)',
  display: 'flex',
  alignItems: 'stretch',
}));

const TransactionLeft = styled.div(({ theme }) => ({
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  borderRight: `1px solid ${color.fade(theme.primary, 0.5)}`,
  padding: '1em 1.5em',
}));

const TransactionDate = styled.div(({ theme }) => ({
  textAlign: 'center',
}));

const Day = styled.div({
  fontSize: 22,
});

const Month = styled.div({});

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
