import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import WaitingMessage from 'components/WaitingMessage';
import rpc from 'lib/rpc';
import { formatDateTime } from 'lib/intl';
import { isPending, fetchTransaction } from 'lib/transactions';

import { categoryText } from './utils';

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const Row = styled.div({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: '1fr 3fr',
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
});

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const Field = ({ label, children }) => (
  <Row>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

@connect(
  ({ settings: { minConfirmations }, transactions: { map } }, props) => ({
    minConfirmations,
    transaction: map[props.txid],
  })
)
export default class TransactionDetailsModal extends React.Component {
  constructor(props) {
    super(props);
    fetchTransaction(this.props.txid);
  }

  render() {
    const { transaction, minConfirmations } = this.props;

    return (
      <Modal>
        <Modal.Header>{__('Transactions Details')}</Modal.Header>
        <Modal.Body>
          {transaction ? (
            <>
              <Field label={__('Time')}>
                {formatDateTime(transaction.time, timeFormatOptions)}
              </Field>
              <Field label={__('Category')}>
                {categoryText(transaction.category)}
              </Field>
              <Field label={__('Amount')}>{transaction.amount}</Field>
              <Field label={__('Account')}>{transaction.account}</Field>
              <Field label={__('Address')}>
                <span className="monospace">{transaction.address}</span>
              </Field>
              <Field label={__('Confirmations')}>
                {transaction.confirmations}
                {isPending(transaction, minConfirmations) &&
                  ` (${__('Pending')})`}
              </Field>
              <Field label={__('Transaction ID')}>
                <span className="monospace">{transaction.txid}</span>
              </Field>
              <Field label={__('Block hash')}>
                <span className="monospace">{transaction.blockhash}</span>
              </Field>
            </>
          ) : (
            <WaitingMessage>
              {__('Loading transaction details...')}
            </WaitingMessage>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}
