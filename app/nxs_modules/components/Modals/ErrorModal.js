// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { color } from 'utils';

const ErrorModalComponent = styled(Modal)({
  width: 500,
});

const XMark = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 56,
  color: theme.error,
  width: 80,
  height: 80,
  borderRadius: '50%',
  borderWidth: 3,
  borderStyle: 'solid',
  filter: `drop-shadow(0 0 5px ${color.fade(theme.error, 0.5)})`,
  margin: '0 auto 20px',
}));

const ErrorMessage = styled.div({
  textAlign: 'center',
  fontSize: 28,
});

const ErrorModalButton = styled(Button)({
  width: '100%',
  marginTop: 20,
  fontSize: 22,
  borderRadius: '0 0 4px 4px',
});

const ErrorModal = ({ message, ...rest }) => (
  <ErrorModalComponent {...rest}>
    {closeModal => (
      <>
        <Modal.Body>
          <XMark>✕</XMark>
          <ErrorMessage>{message}</ErrorMessage>
        </Modal.Body>
        <ErrorModalButton skin="filled-error" onClick={closeModal}>
          Dismiss
        </ErrorModalButton>
      </>
    )}
  </ErrorModalComponent>
);

export default ErrorModal;
