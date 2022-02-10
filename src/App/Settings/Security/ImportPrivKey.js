// External
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import FormField from 'components/FormField';
import FieldSet from 'components/FieldSet';
import { formSubmit, required, trimText } from 'lib/form';
import { openErrorDialog, openSuccessDialog } from 'lib/dialog';
import { showNotification } from 'lib/ui';
import rpc from 'lib/rpc';

__ = __context('Settings.Security');

const ImportPrivKeyForm = styled.div({
  flex: 3,
});

const initialValues = {
  accountName: '',
  privateKey: '',
};

export default function ImportPrivKey() {
  return (
    <Form
      name="importPrivateKey"
      persistState
      initialValues={initialValues}
      onSubmit={formSubmit({
        submit: ({ accountName, privateKey }) =>
          rpc('importprivkey', [privateKey], [accountName]),
        onSuccess: async (result, values, form) => {
          form.restart();
          openSuccessDialog({
            message: __('Private key imported. Rescanning now'),
          });
          showNotification(__('Rescanning...'));
          try {
            await rpc('rescan', []);
            showNotification(__('Rescanning done'), 'success');
          } catch (err) {
            openErrorDialog({
              message: __('Error rescanning'),
              note: (err && err.message) || __('An unknown error occurred'),
            });
          }
        },
        errorMessage: __('Error importing private key'),
      })}
    >
      <ImportPrivKeyForm>
        <FieldSet legend={__('Import private key')}>
          <FormField connectLabel label={__('Account name')}>
            <Form.TextField
              name="accountName"
              type="Text"
              placeholder={__('Account name')}
              config={{ normalize: trimText }}
              validate={required()}
            />
          </FormField>
          <FormField connectLabel label={__('Private key')}>
            <Form.TextField
              name="privateKey"
              type="password"
              placeholder={__('Private key')}
              config={{ normalize: trimText }}
              validate={required()}
            />
          </FormField>
          <Form.SubmitButton skin="primary" wide style={{ marginTop: '2em' }}>
            {__('Import')}
          </Form.SubmitButton>
        </FieldSet>
      </ImportPrivKeyForm>
    </Form>
  );
}
