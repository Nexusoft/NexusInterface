// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import { color } from 'utils';
import checkIcon from 'images/check.sprite.svg';
import Dialog from './Dialog';

const CheckMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 44,
  color: theme.primary,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.primary, 0.5)})`,
}));

const SuccessDialog = ({ message, note, ...rest }) => (
  <Dialog {...rest}>
    {closeModal => (
      <>
        <Modal.Body>
          <CheckMark>
            <Icon icon={checkIcon} />
          </CheckMark>
          <Dialog.Message>{message}</Dialog.Message>
          {!!note && <Dialog.Note>{note}</Dialog.Note>}
        </Modal.Body>
        <Dialog.Button skin="filled-primary" onClick={closeModal}>
          Dismiss
        </Dialog.Button>
      </>
    )}
  </Dialog>
);

export default SuccessDialog;
