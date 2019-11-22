// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import * as color from 'utils/color';
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
  labelYes = __('Yes'),
  skinYes = 'primary',
  callbackYes,
  labelNo = __('No'),
  skinNo = 'default',
  callbackNo,
  ...rest
}) => (
  <Dialog onBackgroundClick={null} escToClose={false} {...rest}>
    {closeModal => (
      <Modal.Body>
        <QuestionMark>?</QuestionMark>
        <Dialog.Message>{question}</Dialog.Message>
        {!!note && <Dialog.Note>{note}</Dialog.Note>}
        <Dialog.Buttons>
          <ConfirmationButton
            skin={skinNo}
            onClick={() => {
              callbackNo && callbackNo();
              closeModal();
            }}
          >
            {labelNo}
          </ConfirmationButton>
          <ConfirmationButton
            skin={skinYes}
            onClick={() => {
              callbackYes && callbackYes();
              closeModal();
            }}
          >
            {labelYes}
          </ConfirmationButton>
        </Dialog.Buttons>
      </Modal.Body>
    )}
  </Dialog>
);

export default ConfirmDialog;
