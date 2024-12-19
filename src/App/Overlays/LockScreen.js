import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import Button from 'components/Button';
import { confirmPin } from 'lib/dialog';
import { toggleLockScreen } from 'lib/ui';
import { selectUsername } from 'lib/session';

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
  const username = useSelector(selectUsername)
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
              toggleLockScreen(false);
            }
          }}
        >
          Unlock
        </UnlockButton>
      </Wrapper>
    </FullScreen>
  );
}
