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
import { refreshAccounts, refreshOwnedTokens } from 'lib/user';
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
import ExpiryFields from './ExpiryFields';
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

function getRecipientsParams({ recipients, advancedOptions }) {
  return recipients.map(({ address, amount, reference }) => ({
    address_to: address,
    amount: parseFloat(amount),
    reference: (!!advancedOptions && reference) || undefined,
  }));
}

function getAdvancedParams({ expiry, advancedOptions }) {
  const params = {};
  if (advancedOptions) {
    const expires =
      parseInt(expiry.expireSeconds) +
      parseInt(expiry.expireMinutes) * 60 +
      parseInt(expiry.expireHours) * 3600 +
      parseInt(expiry.expireDays) * 86400;
    if (Number.isInteger(expires) && expires > 0) {
      params.expires = expires;
    }
  }
  return params;
}

export default function SendForm() {
  const switchID = useId();
  const accountOptions = useSelector(selectAccountOptions);
  const initialValues = useInitialValues();
  useEffect(() => {
    refreshAccounts();
    refreshOwnedTokens();
  }, []);

  return (
    <SendFormComponent>
      <Form
        name={formName}
        persistState
        initialValues={initialValues}
        initialValuesEqual={() => true}
        onSubmit={({ sendFrom, recipients, expiry, advancedOptions }, form) => {
          const state = store.getState();
          const source = getSource(state, sendFrom);
          openModal(PreviewTransactionModal, {
            source,
            recipients: getRecipientsParams({ recipients, advancedOptions }),
            ...getAdvancedParams({ expiry, advancedOptions }),
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

        <ExpiryFields />

        <SendFormButtons>
          <Form.FieldArray
            name="recipients"
            render={({ fields }) => (
              <MultiBtn
                skin="default"
                onClick={() => {
                  fields.push(getDefaultRecipient());
                }}
              >
                <Icon icon={plusIcon} style={{ fontSize: '.8em' }} />
                <span className="v-align ml0_4">{__('Add recipient')}</span>
              </MultiBtn>
            )}
          />
          <SendBtn skin="primary">
            <Icon icon={sendIcon} className="mr0_4" />
            {__('Proceed')}
          </SendBtn>
        </SendFormButtons>
      </Form>
    </SendFormComponent>
  );
}
