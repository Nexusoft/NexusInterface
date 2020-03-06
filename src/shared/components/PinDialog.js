import React from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import TextFieldWithKeyboard from 'components/TextFieldWithKeyboard';
import Button from 'components/Button';
import { removeModal } from 'lib/ui';

__ = __context('PinDialog');

const PinInput = styled(TextFieldWithKeyboard.RF)({
  margin: '1em auto 2.5em',
  fontSize: 18,
});

const PinLabel = styled.div({
  display: 'inline-block',
  height: '15em',
  wordBreak: 'break-word',
  overflow: 'scroll',
});

const formOptions = {
  form: 'pin',
  destroyOnUnmount: true,
  initialValues: {
    pin: '',
  },
  validate: ({ pin }) => {
    const errors = {};
    if (!pin || pin.length < 4) {
      errors.pin = __('Pin must be at least 4 characters');
    }
    return errors;
  },
  onSubmit: ({ pin }, dispatch, props) => {
    if (props.submitPin) {
      props.submitPin(pin);
    }
    removeModal(props.modalId);
  },
};

const PinDialog = ({
  handleSubmit,
  label = null,
  confirmLabel = __('Confirm'),
  onClose,
}) => (
  <Modal style={{ maxWidth: 350 }} onClose={onClose}>
    {closeModal => (
      <>
        <Modal.Header>{__('Enter PIN')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Field
              component={PinInput}
              maskable
              name="pin"
              autoFocus
              skin="filled-inverted"
              placeholder={__('Your PIN')}
            />
            <PinLabel>{label}</PinLabel>
            <div className="flex space-between">
              <Button onClick={closeModal}>{__('Cancel')}</Button>
              <Button type="submit" skin="primary">
                {confirmLabel}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default reduxForm(formOptions)(PinDialog);
