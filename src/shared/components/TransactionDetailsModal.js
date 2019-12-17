import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import WaitingMessage from 'components/WaitingMessage';
import { formatDateTime } from 'lib/intl';
import { fetchTransaction } from 'lib/tritiumTransactions';

__ = __context('TransactionDetails');

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
  (
    {
      settings: { minConfirmations },
      core: {
        transactions: { map },
      },
    },
    props
  ) => ({
    minConfirmations,
    transaction: map && map[props.txid],
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
                {formatDateTime(
                  transaction.timestamp * 1000,
                  timeFormatOptions
                )}
              </Field>
              <Field label={__('Sequence')}>{transaction.sequence}</Field>
              <Field label={__('Type')}>{transaction.type}</Field>
              <Field label={__('Confirmations')}>
                {transaction.confirmations}
              </Field>
              <Field label={__('Transaction ID')}>
                <span className="monospace">{transaction.txid}</span>
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
