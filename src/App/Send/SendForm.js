// External
import { useEffect, useId } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import arrayMutators from 'final-form-arrays';

// Internal Global
import Form from 'components/Form';
import Icon from 'components/Icon';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { openModal } from 'lib/ui';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import {
  formName,
  getDefaultRecipient,
  useInitialValues,
  getSource,
} from 'lib/send';
import { required } from 'lib/form';
import store from 'store';
import { timing } from 'styles';
import sendIcon from 'icons/send.svg';
import plusIcon from 'icons/plus.svg';

// Internal Local
import Recipients from './Recipients';
import { selectAccountOptions } from './selectors';
import PreviewTransactionModal from './PreviewTransactionModal';

__ = __context('Send');

const SendFormComponent = styled.div({
  maxWidth: 900,
  margin: '-.5em auto 0',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '3em',
});

const SendBtn = styled(Form.SubmitButton)({
  flex: 1,
});

const MultiBtn = styled(Button)({
  marginRight: '1em',
});

const AdvancedOptionsSwitch = styled.div({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginTop: 10,
  fontSize: 15,
});

const AdvancedOptionsLabel = styled.label(({ active }) => ({
  transition: `opacity ${timing.normal}`,
  opacity: active ? 1 : 0.67,
}));

function AddRecipientButton() {
  const txExpiry = useSelector((state) => state.core.config?.txExpiry);
  return (
    <Form.FieldArray
      name="recipients"
      render={({ fields }) => (
        <MultiBtn
          skin="default"
          onClick={() => {
            fields.push(getDefaultRecipient({ txExpiry }));
          }}
        >
          <Icon icon={plusIcon} style={{ fontSize: '.8em' }} />
          <span className="v-align ml0_4">{__('Add recipient')}</span>
        </MultiBtn>
      )}
    />
  );
}

function getRecipientsParams(recipients, { advancedOptions }) {
  return recipients.map(
    ({
      address,
      amount,
      reference,
      expireDays,
      expireHours,
      expireMinutes,
      expireSeconds,
    }) => {
      const recipParam = {
        address_to: address,
        amount: parseFloat(amount),
      };

      if (advancedOptions) {
        const expires =
          parseInt(expireSeconds) +
          parseInt(expireMinutes) * 60 +
          parseInt(expireHours) * 3600 +
          parseInt(expireDays) * 86400;
        if (Number.isInteger(expires)) {
          recipParam.expires = expires;
        }
        if (reference) recipParam.reference = reference;
      }

      return recipParam;
    }
  );
}

export default function SendForm() {
  const switchID = useId();
  const accountOptions = useSelector(selectAccountOptions);
  const initialValues = useInitialValues();
  useEffect(() => {
    loadAccounts();
    loadOwnedTokens();
  }, []);

  return (
    <SendFormComponent>
      <Form
        name={formName}
        persistState
        initialValues={initialValues}
        initialValuesEqual={() => true}
        onSubmit={({ sendFrom, recipients, advancedOptions }, form) => {
          const state = store.getState();
          const source = getSource(state, sendFrom);
          openModal(PreviewTransactionModal, {
            source,
            recipients: getRecipientsParams(recipients, { advancedOptions }),
            resetSendForm: form.reset,
          });
        }}
        mutators={{ ...arrayMutators }}
      >
        <div className="flex justify-end">
          <AdvancedOptionsSwitch>
            <Form.Switch
              name="advancedOptions"
              style={{ fontSize: '.75em' }}
              id={switchID}
            />
            <Form.Field
              name="advancedOptions"
              subscription={{ value: true }}
              render={({ input: { value } }) => (
                <AdvancedOptionsLabel
                  className="ml0_4 pointer"
                  htmlFor={switchID}
                  active={value}
                >
                  {__('Advanced options')}
                </AdvancedOptionsLabel>
              )}
            />
          </AdvancedOptionsSwitch>
        </div>

        <FormField label={__('Send from')}>
          <Form.Select
            name="sendFrom"
            skin="filled-inverted"
            placeholder={__('Select an account')}
            options={accountOptions}
            validate={required()}
          />
        </FormField>

        <Form.FieldArray component={Recipients} name="recipients" />

        <SendFormButtons>
          <AddRecipientButton />
          <SendBtn skin="primary">
            <Icon icon={sendIcon} className="mr0_4" />
            {__('Proceed')}
          </SendBtn>
        </SendFormButtons>
      </Form>
    </SendFormComponent>
  );
}
