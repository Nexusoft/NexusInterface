// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Dialog from 'components/Dialog';
import Modal from 'components/Modal';
import Button from 'components/Button';
import { color } from 'utils';

const QuestionMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 56,
  color: theme.light,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.light, 0.5)})`,
}));

const ConfirmationButton = styled(Button)({
  minWidth: 180,
});

const ConfirmModal = ({
  question,
  note,
  yesLabel,
  yesCallback,
  noLabel,
  noCallback,
  ...rest
}) => (
  <Dialog {...rest}>
    {closeModal => (
      <Modal.Body>
        <QuestionMark>?</QuestionMark>
        <Dialog.Message>{question}</Dialog.Message>
        {!!note && <Dialog.Note>{note}</Dialog.Note>}
        <Dialog.Buttons>
          <ConfirmationButton
            onClick={() => {
              noCallback && noCallback();
              closeModal();
            }}
          >
            {noLabel || 'No'}
          </ConfirmationButton>
          <ConfirmationButton
            skin="primary"
            onClick={() => {
              yesCallback && yesCallback();
              closeModal();
            }}
          >
            {yesLabel || 'Yes'}
          </ConfirmationButton>
        </Dialog.Buttons>
      </Modal.Body>
    )}
  </Dialog>
);

export default ConfirmModal;
