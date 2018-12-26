// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { colors } from 'styles';
import { color } from 'utils';

const ConfirmModalWrapper = styled(Modal)({
  width: 500,
});

const QuestionMark = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 56,
  color: colors.light,
  width: 80,
  height: 80,
  borderRadius: '50%',
  borderWidth: 2,
  borderStyle: 'solid',
  filter: `drop-shadow(0 0 5px ${color.fade(colors.light, 0.5)})`,
  margin: '0 auto 20px',
});

const Question = styled.div({
  textAlign: 'center',
  fontSize: 28,
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
        <QuestionMark>?</QuestionMark>
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
