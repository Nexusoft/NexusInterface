import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { formatNumber } from 'lib/intl';

import NewAccountModal from 'components/NewAccountModal';

import Button from 'components/Button';
import Icon from 'components/Icon';
import plusIcon from 'icons/plus.svg';

__ = __context('User.Tokens.TokenDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const CloseButton = styled(Button)({
  marginLeft: '1em',
  width: '25%',
});

const TokenDetailsModal = ({ token }) => (
  <Modal>
    {closeModal => (
      <>
        <Modal.Header>{__('Token Details')}</Modal.Header>
        <Modal.Body>
          {token.name && (
            <InfoField ratio={[1, 2]} label={__('Token name')}>
              {token.name}
            </InfoField>
          )}
          <InfoField ratio={[1, 2]} label={__('Token address')}>
            <div className="monospace">{token.address || '0'}</div>
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Created at')}>
            {formatDateTime(token.created * 1000, timeFormatOptions)}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Last modified')}>
            {formatDateTime(token.modified * 1000, timeFormatOptions)}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Token Owner')}>
            <div className="monospace">{token.owner || '0'}</div>
          </InfoField>

          <InfoField ratio={[1, 2]} label={__('Current Supply')}>
            {token.currentsupply}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Max Supply')}>
            {token.maxsupply}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Decimals')}>
            {token.decimals}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Balance')}>
            {formatNumber(token.balance, token.decimals)} {token.token_name}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Pending balance')}>
            {formatNumber(token.pending, token.decimals)} {token.token_name}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Unconfirmed balance')}>
            {formatNumber(token.unconfirmed, token.decimals)} {token.token_name}
          </InfoField>
          <div className="flex space-between">
            <Button
              wide
              onClick={() =>
                openModal(NewAccountModal, { tokenAddress: token.address })
              }
            >
              <Icon icon={plusIcon} className="space-right" />
              {__('Create new account with this token')}
            </Button>{' '}
            <CloseButton skin="primary" wide onClick={closeModal}>
              {__('Close')}
            </CloseButton>
          </div>
        </Modal.Body>
      </>
    )}
  </Modal>
);

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(TokenDetailsModal);
