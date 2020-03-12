import React from 'react';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import AdjustStakeModal from 'components/AdjustStakeModal';
import { goToSend } from 'lib/send';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { formatNumber } from 'lib/intl';

import { totalBalance } from './utils';

__ = __context('User.Accounts.AccountDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const AccountDetailsModal = ({ account, stakeInfo }) => (
  <Modal>
    {closeModal => (
      <>
        <Modal.Header>{__('Account Details')}</Modal.Header>
        <Modal.Body>
          <InfoField ratio={[1, 2]} label={__('Account name')}>
            {account.name}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Created at')}>
            {formatDateTime(account.created * 1000, timeFormatOptions)}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Last modified')}>
            {formatDateTime(account.modified * 1000, timeFormatOptions)}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Token name')}>
            {account.token_name}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Total account balance')}>
            {formatNumber(totalBalance(account), 6)} {account.token_name}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Available balance')}>
            <span className="v-align">
              {formatNumber(account.balance, 6)} {account.token_name}
            </span>
            &nbsp;&nbsp;
            {account.balance > 0 && (
              <Button
                skin="hyperlink"
                className="v-align"
                onClick={() => {
                  closeModal();
                  goToSend({ sendFrom: account.name });
                }}
              >
                {__('Send %{token_name}', { token_name: account.token_name })}
              </Button>
            )}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Pending balance')}>
            {formatNumber(account.pending, 6)} {account.token_name}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Unconfirmed balance')}>
            {formatNumber(account.unconfirmed, 6)} {account.token_name}
          </InfoField>
          {account.stake !== undefined && (
            <InfoField ratio={[1, 2]} label={__('Stake balance')}>
              {formatNumber(account.stake, 6)} {account.token_name}
            </InfoField>
          )}
          {account.immature !== undefined && (
            <InfoField ratio={[1, 2]} label={__('Immature balance')}>
              {formatNumber(account.immature, 6)} {account.token_name}
            </InfoField>
          )}
          <InfoField ratio={[1, 2]} label={__('Address')}>
            <span className="monospace">{account.address}</span>
          </InfoField>

          {account.stake !== undefined && (
            <div className="mt1 flex space-between">
              <div />{' '}
              {!stakeInfo.stake && !stakeInfo.balance ? (
                <div className="error">{__('Trust Account is empty.')}</div>
              ) : (
                <div className="error">
                  {__('Trust Account must mature for 72 hours before staking')}
                </div>
              )}
              <Button
                disabled={
                  !stakeInfo ||
                  (!stakeInfo.stake && !stakeInfo.balance) ||
                  stakeInfo.new
                }
                onClick={() => {
                  openModal(AdjustStakeModal);
                }}
              >
                {__('Adjust stake amount')}
              </Button>
            </div>
          )}
        </Modal.Body>
      </>
    )}
  </Modal>
);

const mapStateToProps = state => ({
  stakeInfo: state.user.stakeInfo,
});

export default connect(mapStateToProps)(AccountDetailsModal);
