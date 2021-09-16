import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import InfoField from 'components/InfoField';
import QRButton from 'components/QRButton';
import NewAccountModal from 'components/NewAccountModal';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Spinner from 'components/Spinner';
import plusIcon from 'icons/plus.svg';
import { formatDateTime, formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';

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

export default function TokenDetailsModal({ token: tokenProp, tokenAddress }) {
  const [tokenState, setTokenState] = useState(null);
  useEffect(() => {
    if (!tokenProp) {
      callApi('tokens/get/token', {
        address: tokenAddress,
      }).then(setTokenState);
    }
  }, []);
  const token = tokenProp || tokenState;

  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Token Details')}</ControlledModal.Header>
          <ControlledModal.Body>
            {!token && (
              <div className="text-center">
                <Spinner size={24} />
              </div>
            )}

            {token && (
              <>
                {token.ticker && (
                  <InfoField ratio={[1, 2]} label={__('Token name')}>
                    {token.ticker}
                  </InfoField>
                )}
                <InfoField ratio={[1, 2]} label={__('Token address')}>
                  <span className="monospace v-align">
                    {token.address || '0'}
                  </span>
                  <QRButton className="ml0_4" address={token.address} />
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
                  {formatNumber(token.currentsupply, 0)}
                </InfoField>
                <InfoField ratio={[1, 2]} label={__('Max Supply')}>
                  {formatNumber(token.maxsupply, 0)}
                </InfoField>
                <InfoField ratio={[1, 2]} label={__('Decimals')}>
                  {token.decimals}
                </InfoField>
                <InfoField ratio={[1, 2]} label={__('Balance')}>
                  {formatNumber(token.balance, token.decimals)} {token.ticker}
                </InfoField>
                {typeof token.unclaimed === 'number' && (
                  <InfoField ratio={[1, 2]} label={__('Unclaimed balance')}>
                    {formatNumber(token.unclaimed, token.decimals)}{' '}
                    {token.ticker}
                  </InfoField>
                )}
                {typeof token.unconfirmed === 'number' && (
                  <InfoField ratio={[1, 2]} label={__('Unconfirmed balance')}>
                    {formatNumber(token.unconfirmed, token.decimals)}{' '}
                    {token.ticker}
                  </InfoField>
                )}
                <div className="flex space-between">
                  <Button
                    wide
                    onClick={() =>
                      openModal(NewAccountModal, {
                        tokenAddress: token.address,
                        tokenName: token.ticker,
                      })
                    }
                  >
                    <Icon icon={plusIcon} className="mr0_4" />
                    {__('Create new account with this token')}
                  </Button>{' '}
                  <CloseButton skin="primary" wide onClick={closeModal}>
                    {__('Close')}
                  </CloseButton>
                </div>
              </>
            )}
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
