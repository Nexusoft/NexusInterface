import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import FullScreen from './FullScreen';
import Button from 'components/Button';
import { confirmPin } from 'lib/dialog';
import { toggleLockScreen } from 'lib/ui';
import { callAPI } from 'lib/api';
import { useState } from 'react';

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

const ErrorMessage = styled.div(({ theme }) => ({
  color: theme.danger,
  marginTop: '1em',
  textAlign: 'center',
}));

export default function LockedScreen() {
  const [hasError, setHasError] = useState(false);

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
              try {
                const valid = await callAPI('profiles/validpin/master', {
                  pin,
                });
                console.log(valid);
                if (valid.valid) {
                  toggleLockScreen(false);
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
        </Button>
        {hasError && <ErrorMessage>{__('Invalid Pin')}</ErrorMessage>}
      </Wrapper>
    </FullScreen>
  );
}
