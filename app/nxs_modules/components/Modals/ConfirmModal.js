// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { colors } from 'styles';

const ConfirmModalWrapper = styled(Modal)({
  width: 500,
});

const Question = styled.div({
  textAlign: 'center',
  fontSize: 28,
  color: colors.primary,
});

const Buttons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 50,
  fontSize: 18,
});

const ConfirmModalButton = styled(Button)({
  minWidth: 180,
});

const ConfirmModal = ({
  question,
  yesLabel,
  yesCallback,
  noLabel,
  noCallback,
  ...rest
}) => (
  <ConfirmModalWrapper {...rest}>
    {closeModal => (
      <Modal.Body>
        <Question>{question}</Question>
        <Buttons>
          <ConfirmModalButton
            onClick={() => {
              noCallback && noCallback();
              closeModal();
            }}
          >
            {noLabel || 'No'}
          </ConfirmModalButton>
          <ConfirmModalButton
            skin="primary"
            onClick={() => {
              yesCallback && yesCallback();
              closeModal();
            }}
          >
            {yesLabel || 'Yes'}
          </ConfirmModalButton>
        </Buttons>
      </Modal.Body>
    )}
  </ConfirmModalWrapper>
);

export default ConfirmModal;
