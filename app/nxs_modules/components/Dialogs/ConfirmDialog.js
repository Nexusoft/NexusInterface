// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { color } from 'utils';
import Dialog from './Dialog';

const QuestionMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 56,
  color: theme.foreground,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.foreground, 0.5)})`,
}));

const ConfirmationButton = styled(Button)({
  minWidth: 180,
});

const ConfirmDialog = ({
  question,
  note,
  yesLabel = 'Yes',
  yesSkin = 'primary',
  yesCallback,
  noLabel = 'No',
  noSkin = undefined,
  noCallback,
  ...rest
}) => (
  <Dialog onBackgroundClick={null} {...rest}>
    {closeModal => (
      <Modal.Body>
        <QuestionMark>?</QuestionMark>
        <Dialog.Message>{question}</Dialog.Message>
        {!!note && <Dialog.Note>{note}</Dialog.Note>}
        <Dialog.Buttons>
          <ConfirmationButton
            skin={noSkin}
            onClick={() => {
              noCallback && noCallback();
              closeModal();
            }}
          >
            {noLabel}
          </ConfirmationButton>
          <ConfirmationButton
            skin={yesSkin}
            onClick={() => {
              yesCallback && yesCallback();
              closeModal();
            }}
          >
            {yesLabel}
          </ConfirmationButton>
        </Dialog.Buttons>
      </Modal.Body>
    )}
  </Dialog>
);

export default ConfirmDialog;
