// External
import styled from '@emotion/styled';

// Internal
import FormField from 'components/FormField';
import FieldSet from 'components/FieldSet';
import Form from 'components/Form';
import { formSubmit, required, checkAll, regex } from 'lib/form';
import { openSuccessDialog } from 'lib/dialog';
import rpc from 'lib/rpc';
import { startCore } from 'lib/core';
import { consts } from 'styles';
import {
  passwordRegex,
  passwordMinLength,
  passwordNoSpaces,
  passwordsMatch,
} from './common';

__ = __context('Settings.Security');

const EncryptWalletForm = styled.div({
  flex: 2,
  marginRight: '1em',
});

const Note = styled.div(({ theme }) => ({
  padding: '1em',
  border: `2px dashed ${theme.mixer(0.5)}`,
  color: theme.mixer(0.5),
}));

const Characters = styled.span({
  fontFamily: consts.monoFontFamily,
  letterSpacing: 4,
});

const initialValues = {
  password: '',
  passwordRepeat: '',
};

export default function EncryptWallet() {
  return (
    <Form
      name="encryptWallet"
      persistState
      initialValues={initialValues}
      onSubmit={formSubmit({
        submit: ({ password }) => rpc('encryptwallet', [password]),
        onSuccess: (result, values, form) => {
          form.restart();
          openSuccessDialog({
            message: __('Wallet has been encrypted.'),
            onClose: () => {
              // In some old version, core stops after wallet is encrypted
              // So start the core here for legacy support
              startCore();
            },
          });
        },
        errorMessage: __('Error encrypting wallet'),
      })}
    >
      <EncryptWalletForm>
        <FieldSet legend={__('Encrypt wallet')}>
          <Note>
            {__('Password cannot contain these characters:')}
            <br />
            <Characters>{' -$/&*|<>'}</Characters>
          </Note>
          <FormField connectLabel label={__('Password')}>
            <Form.TextField
              name="password"
              type="password"
              placeholder={__('New password')}
              validate={checkAll(
                required(),
                regex(
                  passwordRegex,
                  __('Password cannot contain these characters:') +
                    ' - $ / & * | < >'
                ),
                passwordMinLength,
                passwordNoSpaces
              )}
            />
          </FormField>
          <FormField connectLabel label={__('Re-enter password')}>
            <Form.TextField
              name="passwordRepeat"
              type="password"
              placeholder={__('Confirm password')}
              validate={passwordsMatch}
            />
          </FormField>

          <Form.SubmitButton skin="primary" wide style={{ marginTop: '2em' }}>
            {__('Encrypt and restart')}
          </Form.SubmitButton>
        </FieldSet>
      </EncryptWalletForm>
    </Form>
  );
}
