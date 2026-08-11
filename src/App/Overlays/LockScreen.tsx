import styled from '@emotion/styled';
import Button from 'components/Button';
import { confirmPin, openErrorDialog } from 'lib/dialog';
import { walletLockedAtom } from 'lib/wallet';
import { store } from 'lib/store';
import { callAPI } from 'lib/api';

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

const UnlockButton = styled(Button)({
  maxWidth: 300,
});

export default function LockedScreen() {
  return (
    <FullScreen>
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
                if (valid) {
                  store.set(walletLockedAtom, false);
                } else {
                  openErrorDialog({
                    message: __('Invalid Pin'),
                  });
                }
              } catch (error: any) {
                openErrorDialog({
                  message: __('Error unlocking wallet'),
                  note: error?.message || __('Unknown error'),
                });
              }
            }
          }}
        >
          Unlock
        </UnlockButton>
      </Wrapper>
    </FullScreen>
  );
}
