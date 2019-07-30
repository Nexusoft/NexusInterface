import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

import FullScreen from './FullScreen';

const breathe = keyframes`
  0% {
    opacity: 1
  }
  100% {
    opacity: .5
  }
`;

const ClosingMessage = styled.div(({ theme }) => ({
  textAlign: 'center',
  color: theme.primary,
  fontSize: 24,
  animation: `${breathe} 2s ease 0s infinite alternate`,
}));

const ClosingScreen = () => (
  <FullScreen>
    <div className="flex center">
      <ClosingMessage>{__('Closing Nexus Wallet')}</ClosingMessage>
    </div>
  </FullScreen>
);

export default ClosingScreen;
