import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

import Modal from 'components/Modal';
import { timing, consts } from 'styles';

const intro = keyframes`
  from {
    opacity: 0;
    transform: scale(1.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const breathe = keyframes`
  0% {
    opacity: 1
  }
  100% {
    opacity: .5
  }
`;

const ClosingModalComponent = styled(Modal)({
  animation: `${intro} ${timing.normal} ${consts.enhancedEaseOut}`,
});

const ModalBody = styled(Modal.Body)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ClosingMessage = styled.div(({ theme }) => ({
  color: theme.primary,
  fontSize: 24,
  animation: `${breathe} 2s ease 0s infinite alternate`,
}));

const ClosingModal = () => (
  <ClosingModalComponent fullScreen>
    <ModalBody>
      <ClosingMessage>Closing Nexus...</ClosingMessage>
    </ModalBody>
  </ClosingModalComponent>
);

export default ClosingModal;
