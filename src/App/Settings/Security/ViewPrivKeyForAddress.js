// External
import { useState } from 'react';
import { clipboard } from 'electron';

// Internal
import Form from 'components/Form';
import Icon from 'components/Icon';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import InputGroup from 'components/InputGroup';
import { formSubmit, required } from 'lib/form';
import { showNotification } from 'lib/ui';
import rpc from 'lib/rpc';
import copyIcon from 'icons/copy.svg';

__ = __context('Settings.Security');

const initialValues = {
  address: '',
};

export default function ViewPrivKeyForAddress() {
  const [privateKey, setPrivateKey] = useState('');

  const copyPrivkey = () => {
    clipboard.writeText(privateKey);
    showNotification(__('Copied to clipboard'), 'success');
  };

  const handleStateChange = ({ values: { address } }) => {
    if (address) {
      setPrivateKey('');
    }
  };

  return (
    <Form
      name="viewPrivateKey"
      persistState
      initialValues={initialValues}
      onSubmit={formSubmit({
        submit: ({ address }) => rpc('dumpprivkey', [address]),
        onSuccess: (result) => {
          setPrivateKey(result);
        },
        errorMessage: __('Error getting private key'),
      })}
    >
      <FieldSet legend={__('View private key for address')}>
        <Form.Spy
          subscription={{ values: true }}
          onChange={handleStateChange}
        />
        <FormField connectLabel label={__('Address')}>
          {(inputId) => (
            <InputGroup>
              <Form.TextField
                name="address"
                id={inputId}
                placeholder={__('Enter address here')}
                validate={required()}
              />

              <Form.SubmitButton skin="primary" fitHeight>
                {__('View private key')}
              </Form.SubmitButton>
            </InputGroup>
          )}
        </FormField>

        <FormField label={__('Private key')}>
          <InputGroup>
            <TextField
              readOnly
              type="password"
              placeholder={__('Private key will be displayed here')}
              value={privateKey}
            />
            <Button fitHeight className="relative" onClick={copyPrivkey}>
              <Icon icon={copyIcon} className="mr0_4" />
              {__('Copy')}
            </Button>
          </InputGroup>
        </FormField>
      </FieldSet>
    </Form>
  );
}
