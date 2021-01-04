// External Dependencies
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const breathe = keyframes`
  0% {
    opacity: .8
  }
  100% {
    opacity: .4
  }
`;

const WaitingMessage = styled.div({
  textAlign: 'center',
  padding: '30px 0',
  fontSize: '1.2em',
  animation: `${breathe} 1.5s ease 0s infinite alternate`,
});

export default WaitingMessage;
