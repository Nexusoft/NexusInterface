import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';
import Button from 'components/Button';
import { confirmPin } from 'lib/dialog';
import { usernameAtom } from 'lib/session';
import { walletLockedAtom } from 'lib/wallet';
import { store } from 'lib/store';
import { callAPI } from 'lib/api';
import { useState } from 'react';

import FullScreen from './FullScreen';

const Wrapper = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const BannerMessage = styled.div(({ theme }) => ({
  color: theme.primary,
  fontSize: 24,
  paddingBottom: '2em',
}));

const ErrorMessage = styled.div(({ theme }) => ({
  color: theme.danger,
  marginTop: '1em',
  textAlign: 'center',
}));

const UnlockButton = styled(Button)({
  maxWidth: 300,
});

export default function LockedScreen() {
  const [hasError, setHasError] = useState(false);
  const username = useAtomValue(usernameAtom);
  return (
    <FullScreen width={null}>
      <Wrapper>
        <BannerMessage>{__('Wallet is locked')}</BannerMessage>
        <UnlockButton
          skin="primary"
          wide
          onClick={async () => {
            const pin = await confirmPin({
              confirmLabel: 'Unlock',
            });
            if (pin) {
              try {
                const valid = await callAPI('sessions/validate/pin', {
                  pin,
                });
                console.log(valid);
                if (valid) {
                  store.set(walletLockedAtom, false);
                } else {
                  setHasError(true);
                }
              } catch (error) {
                setHasError(true);
              }
            }
          }}
        >
          Unlock
        </UnlockButton>
        {hasError && <ErrorMessage>{__('Invalid Pin')}</ErrorMessage>}
      </Wrapper>
    </FullScreen>
  );
}
