import React from 'react';

import Modal from 'components/Modal';
import FormField from 'components/FormField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import { openErrorDialog } from 'lib/ui';

__ = __context('ConfirmPassword&PIN');

export default class ConfirmPasswordPinModal extends React.Component {
  state = {
    password: '',
    pin: '',
  };

  confirm = e => {
    e.preventDefault();
    if (
      this.state.password === this.props.password &&
      this.state.pin === this.props.pin
    ) {
      this.closeModal();
      this.props.onConfirm();
    } else {
      openErrorDialog({
        message: __('Password/PIN mismatch'),
        note: __(
          'You have entered either your password or your PIN incorrectly, please re-check'
        ),
      });
    }
  };

  render() {
    const { isNew, password, pin, onConfirm, ...rest } = this.props;
    return (
      <Modal
        assignClose={closeModal => (this.closeModal = closeModal)}
        style={{ maxWidth: 500 }}
        {...rest}
      >
        <Modal.Header>{__('Confirm password and PIN')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={this.confirm}>
            <div>
              {isNew
                ? __(
                    'Enter your new password & new PIN once again to make sure you have entered them correctly'
                  )
                : __(
                    'Enter your password & PIN once again to make sure you have entered them correctly'
                  )}
            </div>

            <FormField label={__('Password')}>
              <MaskableTextField
                value={this.state.password}
                onChange={e => {
                  this.setState({ password: e.target.value });
                }}
                placeholder={
                  isNew
                    ? __('Re-enter your new password')
                    : __('Re-enter your password')
                }
                autoFocus
              />
            </FormField>

            <FormField label={__('PIN')}>
              <MaskableTextField
                value={this.state.pin}
                onChange={e => {
                  this.setState({ pin: e.target.value });
                }}
                placeholder={
                  isNew
                    ? __('Re-enter your new PIN number')
                    : __('Re-enter your PIN number')
                }
              />
            </FormField>

            <Button skin="primary" wide type="submit" className="mt2">
              {__('Confirm')}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
