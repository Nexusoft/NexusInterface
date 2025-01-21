import { Component } from 'react';

import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import TextFieldWithKeyboard from 'components/TextFieldWithKeyboard';
import Button from 'components/Button';
import { openErrorDialog } from 'lib/dialog';
import { resolveValue } from 'lib/form';

__ = __context('ConfirmPassword&PIN');

export default class ConfirmPasswordPinModal extends Component {
  state = {
    password: '',
    pin: '',
  };

  confirm = (e) => {
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
      <ControlledModal
        assignClose={(closeModal) => (this.closeModal = closeModal)}
        maxWidth={500}
        {...rest}
      >
        <ControlledModal.Header>
          {__('Confirm password and PIN')}
        </ControlledModal.Header>
        <ControlledModal.Body>
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
              <TextFieldWithKeyboard
                maskable
                value={this.state.password}
                onChange={(input) => {
                  this.setState({ password: resolveValue(input) });
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
              <TextFieldWithKeyboard
                maskable
                value={this.state.pin}
                onChange={(input) => {
                  this.setState({ pin: resolveValue(input) });
                }}
                placeholder={
                  isNew ? __('Re-enter your new PIN') : __('Re-enter your PIN')
                }
              />
            </FormField>

            <Button skin="primary" wide type="submit" className="mt2">
              {__('Confirm')}
            </Button>
          </form>
        </ControlledModal.Body>
      </ControlledModal>
    );
  }
}
