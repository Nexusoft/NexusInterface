// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { colors } from 'styles';
import { color } from 'utils';
import checkIcon from 'images/check.sprite.svg';

const SuccessModalComponent = styled(Modal)({
  width: 500,
});

const CheckMark = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 44,
  color: colors.primary,
  width: 80,
  height: 80,
  borderRadius: '50%',
  borderWidth: 3,
  borderStyle: 'solid',
  filter: `drop-shadow(0 0 5px ${color.fade(colors.primary, 0.5)})`,
  margin: '0 auto 20px',
});

const ErrorMessage = styled.div({
  textAlign: 'center',
  fontSize: 28,
});

const SuccessModalButton = styled(Button)({
  width: '100%',
  marginTop: 20,
  fontSize: 22,
  borderRadius: '0 0 4px 4px',
});

const SuccessModal = ({ message, ...rest }) => (
  <SuccessModalComponent {...rest}>
    {closeModal => (
      <>
        <Modal.Body>
          <CheckMark>
            <Icon icon={checkIcon} />
          </CheckMark>
          <ErrorMessage>{message}</ErrorMessage>
        </Modal.Body>
        <SuccessModalButton skin="filled-primary" onClick={closeModal}>
          Dismiss
        </SuccessModalButton>
      </>
    )}
  </SuccessModalComponent>
);

export default SuccessModal;
