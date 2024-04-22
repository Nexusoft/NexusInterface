import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import FullScreen from './FullScreen';
import Button from 'components/Button';
import { confirmPin } from 'lib/dialog';
import { toggleLockScreen } from 'lib/ui';

const breathe = keyframes`
  0% {
    opacity: 1
  }
  100% {
    opacity: .5
  }
`;

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
  animation: `${breathe} 2s ease 0s infinite alternate`,
}));

export default function LockedScreen() {
  return (
    <FullScreen width={null}>
      <Wrapper>
        <BannerMessage>{__('Locked')}</BannerMessage>
        <Button
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
        </Button>
      </Wrapper>
    </FullScreen>
  );
}
