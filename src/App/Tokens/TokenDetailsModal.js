import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { formatNumber } from 'lib/intl';

import NexusAddress from 'components/NexusAddress';

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

const TokenDetailsModal = ({ token }) => (
  <Modal>
    <Modal.Header>{__('Token Details')}</Modal.Header>
    <Modal.Body>
      {token.name && <Field label={__('Token name')}>{token.name}</Field>}
      <Field label={__('Token address')}>
        <NexusAddress address={token.address} />
      </Field>
      <Field label={__('Created at')}>
        {formatDateTime(token.created * 1000, timeFormatOptions)}
      </Field>
      <Field label={__('Last modified')}>
        {formatDateTime(token.modified * 1000, timeFormatOptions)}
      </Field>
      <Field label={__('Token Owner')}>
        <NexusAddress address={token.owner} />
      </Field>

      <Field label={__('Current Supply')}>{token.currentsupply}</Field>
      <Field label={__('Max Supply')}>{token.maxsupply}</Field>
      <Field label={__('Decimals')}>{token.decimals}</Field>
      <Field label={__('Balance')}>
        {formatNumber(token.balance, token.decimals)} {token.token_name}
      </Field>
      <Field label={__('Pending balance')}>
        {formatNumber(token.pending, token.decimals)} {token.token_name}
      </Field>
      <Field label={__('Unconfirmed balance')}>
        {formatNumber(token.unconfirmed, token.decimals)} {token.token_name}
      </Field>
    </Modal.Body>
  </Modal>
);

const mapStateToProps = state => ({
  stakeInfo: state.core.stakeInfo,
});

export default connect(mapStateToProps)(TokenDetailsModal);
