import React from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import WaitingMessage from 'components/WaitingMessage';
import rpc from 'lib/rpc';
import { formatDateTime } from 'lib/intl';

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

export default class TransactionDetailsModal extends React.Component {
  state = {
    transaction: null,
  };

  constructor(props) {
    super(props);
    rpc('gettransaction', [this.props.txid]).then(transaction =>
      this.setState({ transaction })
    );
  }

  render() {
    const { transaction } = this.state;

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
                {categoryText(transaction.details[0].category)}
              </Field>
              <Field label={__('Amount')}>
                {transaction.details[0].amount}
              </Field>
              <Field label={__('Account')}>
                {transaction.details[0].account}
              </Field>
              <Field label={__('Address')}>
                <span className="monospace">
                  {transaction.details[0].address}
                </span>
              </Field>
              <Field label={__('Confirmations')}>
                {transaction.confirmations}
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
