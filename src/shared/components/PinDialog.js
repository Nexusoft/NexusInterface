import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import TextField from 'components/TextField';
import Button from 'components/Button';
import { removeModal } from 'actions/overlays';
import { numericOnly } from 'utils/form';

const PinInput = styled(TextField.RF)({
  margin: '1em auto 2.5em',
  fontSize: 18,
});

const actionCreators = { removeModal };

const formOptions = {
  form: 'pin',
  destroyOnUnmount: true,
  validate: ({ pin }) => {
    const errors = {};
    if (!pin || pin.length < 4) {
      errors.pin = __('Pin must be at least 4 characters');
    }
    return errors;
  },
  onSubmit: ({ pin }, dispatch, props) => {
    if (props.onConfirm) {
      props.onConfirm(pin);
    }
    props.removeModal(props.modalId);
  },
};

const PinDialog = ({ handleSubmit, confirmLabel = __('Confirm') }) => (
  <Modal style={{ maxWidth: 350 }}>
    {closeModal => (
      <>
        <Modal.Header>{__('Enter PIN number')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Field
              component={PinInput}
              name="pin"
              normalize={numericOnly}
              type="password"
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

export default connect(
  null,
  actionCreators
)(reduxForm(formOptions)(PinDialog));
