import React from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import { formatDateTime } from 'lib/intl';

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
  gridTemplateColumns: '1fr 2fr',
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

function totalBalance(account) {
  const {
    balance = 0,
    pending = 0,
    unconfirmed = 0,
    stake = 0,
    immature = 0,
  } = account;
  return balance + pending + unconfirmed + stake + immature;
}

export default class AccountDetailsModal extends React.Component {
  render() {
    const { account } = this.props;
    return (
      <Modal>
        <Modal.Header>{__('Account Details')}</Modal.Header>
        <Modal.Body>
          <Field label={__('Account name')}>{account.name}</Field>
          <Field label={__('Created time')}>
            {formatDateTime(account.created * 1000, timeFormatOptions)}
          </Field>
          <Field label={__('Last modified')}>
            {formatDateTime(account.modified * 1000, timeFormatOptions)}
          </Field>
          <Field label={__('Token name')}>{account.token_name}</Field>
          <Field label={__('Total balance')}>
            {totalBalance(account)} {account.token_name}
          </Field>
          <Field label={__('Available balance')}>
            {account.balance} {account.token_name}
          </Field>
          <Field label={__('Pending balance')}>
            {account.pending} {account.token_name}
          </Field>
          <Field label={__('Unconfirmed balance')}>
            {account.unconfirmed} {account.token_name}
          </Field>
          {typeof account.stake === 'number' && (
            <Field label={__('Stake balance')}>
              {account.stake} {account.token_name}
            </Field>
          )}
          {typeof account.stake === 'number' && (
            <Field label={__('Immature balance')}>
              {account.immature} {account.token_name}
            </Field>
          )}
          <Field label={__('Address')}>
            <span className="monospace">{account.address}</span>
          </Field>
        </Modal.Body>
      </Modal>
    );
  }
}
