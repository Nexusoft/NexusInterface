import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import { formatDateTime } from 'lib/intl';

import { totalBalance } from './utils';

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

const AccountDetailsModal = ({ account, stakeInfo }) => (
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
      {account.stake !== undefined && (
        <Field label={__('Stake balance')}>
          {account.stake} {account.token_name}
        </Field>
      )}
      {account.immature !== undefined && (
        <Field label={__('Immature balance')}>
          {account.immature} {account.token_name}
        </Field>
      )}
      <Field label={__('Address')}>
        <span className="monospace">{account.address}</span>
      </Field>

      {account.stake !== undefined && (
        <div className="mt1 flex space-between">
          <div />
          <Button
            disabled={!stakeInfo || (!stakeInfo.stake && !stakeInfo.balance)}
          >
            {__('Adjust stake balance')}
          </Button>
        </div>
      )}
    </Modal.Body>
  </Modal>
);

const mapStateToProps = state => ({
  stakeInfo: state.core.stakeInfo,
});

export default connect(mapStateToProps)(AccountDetailsModal);
