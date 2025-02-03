import { useState, useRef, ComponentProps } from 'react';

import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import TextFieldWithKeyboard from 'components/TextFieldWithKeyboard';
import Button from 'components/Button';
import { openErrorDialog } from 'lib/dialog';
import { resolveValue } from 'lib/form';

__ = __context('ConfirmPassword&PIN');

export type ConfirmPasswordPinDialogProps = ComponentProps<
  typeof ControlledModal
> & {
  isNew: boolean;
  enteredPassword: string;
  enteredPin: string;
  onConfirm?: () => void;
};

export default function ConfirmPasswordPinDialog({
  isNew,
  enteredPassword,
  enteredPin,
  onConfirm,
  ...rest
}: ConfirmPasswordPinDialogProps) {
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const closeRef = useRef<() => void>();

  return (
    <ControlledModal
      assignClose={(closeModal) => (closeRef.current = closeModal)}
      maxWidth={500}
      {...rest}
    >
      <ControlledModal.Header>
        {__('Confirm password and PIN')}
      </ControlledModal.Header>
      <ControlledModal.Body>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password === enteredPassword && pin === enteredPin) {
              closeRef.current?.();
              onConfirm?.();
            } else {
              openErrorDialog({
                message: __('Password/PIN mismatch'),
                note: __(
                  'You have entered either your password or your PIN incorrectly, please re-check'
                ),
              });
            }
          }}
        >
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
              value={password}
              onChange={(input) => {
                setPassword(resolveValue(input));
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
              value={pin}
              onChange={(input) => {
                setPin(resolveValue(input));
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
