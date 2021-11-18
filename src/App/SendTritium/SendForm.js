// External
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import Form from 'components/Form';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Select from 'components/Select';
import FormField from 'components/FormField';
import Switch from 'components/Switch';
import { openModal } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';
import { formName, getDefaultValues, getDefaultRecipient } from 'lib/send';
import { required } from 'lib/form';
import sendIcon from 'icons/send.svg';
import { timing } from 'styles';
import useUID from 'utils/useUID';
import { addressRegex } from 'consts/misc';
import plusIcon from 'icons/plus.svg';

// Internal Local
import Recipients from './Recipients';
import {
  selectAccountOptions,
  selectAddressNameMap,
  getRegisteredFieldNames,
  selectInitialValues,
  getSource,
} from './selectors';
import PreviewTransactionModal from './PreviewTransactionModal';

__ = __context('Send');

const SendFormComponent = styled.div({
  maxWidth: 740,
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

const valueSelector = formValueSelector(formName);
const mapStateToProps = (state) => {};

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
      const recipParam = {};

      if (addressRegex.test(address)) {
        recipParam.address_to = address;
      } else {
        recipParam.name_to = address;
      }
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
      recipParam.amount = parseFloat(amount);

      return recipParam;
    }
  );
}

export default function SendForm() {
  const switchID = useUID();

  const source = useSelector((state) => getSource(state, sendFrom));
  const accountOptions = useSelector(selectAccountOptions);
  // fieldNames: getRegisteredFieldNames(form[formName]?.registeredFields),
  const initialValues = useSelector(selectInitialValues);

  // const confirmSend = (e) => {
  //   e.preventDefault();

  //   if (invalid) {
  //     // Mark the form touched so that the validation errors will be shown.
  //     // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
  //     // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
  //     touch(...fieldNames);
  //     return;
  //   }
  //   handleSubmit();
  // };

  return (
    <SendFormComponent>
      <Form
        form={formName}
        persistState
        initialValues={initialValues}
        // validate: ({ sendFrom, recipients }) => {
        //   const errors = {};
        //   if (!sendFrom) {
        //     errors.sendFrom = __('No accounts selected');
        //   }

        //   if (!recipients || !recipients.length) {
        //     errors.recipients = {
        //       _error: __('There must be at least one recipient'),
        //     };
        //   } else {
        //     const recipientsErrors = [];

        //     recipients.forEach(({ address, amount, reference }, i) => {
        //       const recipientErrors = {};
        //       if (!address) {
        //         recipientErrors.address = __('Address/Name is required');
        //       }
        //       const floatAmount = parseFloat(amount);
        //       if (!floatAmount || floatAmount < 0) {
        //         recipientErrors.amount = __('Invalid amount');
        //       }
        //       if (reference) {
        //         if (!uintRegex.test(reference)) {
        //           recipientErrors.reference = __(
        //             'Reference must be an unsigned integer'
        //           );
        //         } else {
        //           if (Number(reference) > 18446744073709551615) {
        //             recipientErrors.reference = __('Number is too large');
        //           }
        //         }
        //       }
        //       if (Object.keys(recipientErrors).length) {
        //         recipientsErrors[i] = recipientErrors;
        //       }
        //     });

        //     if (recipientsErrors.length) {
        //       errors.recipients = recipientsErrors;
        //     }
        //   }

        //   return errors;
        // },
        onSubmit={({ recipients, advancedOptions }, form) => {
          openModal(PreviewTransactionModal, {
            source,
            recipients: getRecipientsParams(recipients, { advancedOptions }),
            resetSendForm: form.reset,
          });
        }}
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
