// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import { color } from 'utils';
import Dialog from './Dialog';

const XMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 56,
  color: theme.danger,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.danger, 0.5)})`,
}));

const ErrorDialog = ({ message, note, ...rest }) => (
  <Dialog {...rest}>
    {closeModal => (
      <>
        <Modal.Body>
          <XMark>✕</XMark>
          <Dialog.Message>{message}</Dialog.Message>
          {!!note && <Dialog.Note>{note}</Dialog.Note>}
        </Modal.Body>
        <Dialog.Button skin="filled-error" onClick={closeModal}>
          Dismiss
        </Dialog.Button>
      </>
    )}
  </Dialog>
);

export default ErrorDialog;
