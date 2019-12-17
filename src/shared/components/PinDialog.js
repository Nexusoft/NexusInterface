import React from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import { removeModal } from 'lib/ui';
import { numericOnly } from 'utils/form';

__ = __context('PinDialog');

const PinInput = styled(MaskableTextField.RF)({
  margin: '1em auto 2.5em',
  fontSize: 18,
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

const PinDialog = ({ handleSubmit, confirmLabel = __('Confirm'), onClose }) => (
  <Modal style={{ maxWidth: 350 }} onClose={onClose}>
    {closeModal => (
      <>
        <Modal.Header>{__('Enter PIN number')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Field
              component={PinInput}
              name="pin"
              normalize={numericOnly}
              autoFocus
              skin="filled-inverted"
              placeholder={__('Your PIN number')}
            />
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
