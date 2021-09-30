// External
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import Icon from 'components/Icon';
import Button from 'components/Button';
import Select from 'components/Select';
import FormField from 'components/FormField';
import Switch from 'components/Switch';
import { openModal } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';
import { formName, getDefaultValues, getDefaultRecipient } from 'lib/send';
import sendIcon from 'icons/send.svg';
import { timing } from 'styles';
import useUID from 'utils/useUID';
import { addressRegex } from 'consts/misc';
import plusIcon from 'icons/plus.svg';

// Internal Local
import Recipients from './Recipients';
import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
  getSendSource,
} from './selectors';
import PreviewTransactionModal from './PreviewTransactionModal';

__ = __context('Send');

const SendFormComponent = styled.form({
  maxWidth: 740,
  margin: '-.5em auto 0',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '3em',
});

const SendBtn = styled(Button)({
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
const mapStateToProps = (state) => {
  const {
    addressBook,
    user: { accounts, tokens },
    form,
  } = state;
  const sendFrom = valueSelector(state, 'sendFrom');
  const source = getSendSource(sendFrom, accounts, tokens);
  const txExpiry = state.core.config?.txExpiry;
  return {
    source,
    accountOptions: getAccountOptions(accounts, tokens),
    addressNameMap: getAddressNameMap(addressBook),
    fieldNames: getRegisteredFieldNames(form[formName]?.registeredFields),
    initialValues: getDefaultValues({ txExpiry }),
    txExpiry,
  };
};

const uintRegex = /^[0-9]+$/;

async function asyncValidateRecipient({ recipient, source }) {
  const { address } = recipient;
  const params = {};

  // Check if it's a valid address/name
  if (addressRegex.test(address)) {
    const result = await callApi('system/validate/address', {
      address,
    });
    if (result.valid) {
      params.address = address;
    }
  }
  if (!params.address) {
    try {
      const result = await callApi('names/get/name', { name: address });
      params.address = result.register;
    } catch (err) {
      throw { address: __('Invalid name/address') };
    }
  }

  // Check if recipient is on the same token as source
  const sourceToken = source?.account?.token || source?.token?.address;
  if (sourceToken !== address) {
    let account;
    try {
      account = await callApi('finance/get/account', params);
    } catch (err) {
      let token;
      try {
        token = await callApi('tokens/get/token', params);
      } catch (err) {}
      if (token) {
        throw {
          address: __('Source and recipient must be of the same token'),
        };
      }
    }
    if (account && account?.token !== sourceToken) {
      throw {
        address: __('Source and recipient must be of the same token'),
      };
    }
  }

  return null;
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

const reduxFormOptions = {
  form: formName,
  destroyOnUnmount: false,
  validate: ({ sendFrom, recipients }) => {
    const errors = {};
    if (!sendFrom) {
      errors.sendFrom = __('No accounts selected');
    }

    if (!recipients || !recipients.length) {
      errors.recipients = {
        _error: __('There must be at least one recipient'),
      };
    } else {
      const recipientsErrors = [];

      recipients.forEach(({ address, amount, reference }, i) => {
        const recipientErrors = {};
        if (!address) {
          recipientErrors.address = __('Address/Name is required');
        }
        const floatAmount = parseFloat(amount);
        if (!floatAmount || floatAmount < 0) {
          recipientErrors.amount = __('Invalid amount');
        }
        if (reference) {
          if (!uintRegex.test(reference)) {
            recipientErrors.reference = __(
              'Reference must be an unsigned integer'
            );
          } else {
            if (Number(reference) > 18446744073709551615) {
              recipientErrors.reference = __('Number is too large');
            }
          }
        }
        if (Object.keys(recipientErrors).length) {
          recipientsErrors[i] = recipientErrors;
        }
      });

      if (recipientsErrors.length) {
        errors.recipients = recipientsErrors;
      }
    }

    return errors;
  },
  asyncBlurFields: ['recipients[].address'],
  asyncValidate: async ({ recipients }, dispatch, { source }) => {
    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        asyncValidateRecipient({ recipient, source })
      )
    );
    if (results.some(({ status }) => status === 'rejected')) {
      throw {
        recipients: results.map(({ status, reason }) =>
          status === 'rejected' ? reason : undefined
        ),
      };
    } else {
      return null;
    }
  },
  onSubmit: ({ recipients, advancedOptions }, dispatch, { source, reset }) => {
    openModal(PreviewTransactionModal, {
      source,
      recipients: getRecipientsParams(recipients, { advancedOptions }),
      resetSendForm: reset,
    });
  },
};

function SendForm({
  handleSubmit,
  invalid,
  touch,
  fieldNames,
  array,
  txExpiry,
  accountOptions,
  change,
  source,
}) {
  const switchID = useUID();

  const confirmSend = (e) => {
    e.preventDefault();

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown.
      // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
      // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }
    handleSubmit();
  };

  const addRecipient = () => {
    array.push('recipients', getDefaultRecipient({ txExpiry }));
  };

  return (
    <SendFormComponent onSubmit={confirmSend}>
      <div className="flex justify-end">
        <AdvancedOptionsSwitch>
          <Field
            name="advancedOptions"
            component={Switch.RF}
            style={{ fontSize: '.75em' }}
            id={switchID}
          />
          <Field
            name="advancedOptions"
            component={({ input: { value } }) => (
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
        <Field
          component={Select.RF}
          skin="filled-inverted"
          name="sendFrom"
          placeholder={__('Select an account')}
          options={accountOptions}
        />
      </FormField>

      <FieldArray
        component={Recipients}
        name="recipients"
        change={change}
        addRecipient={addRecipient}
        source={source}
      />

      <SendFormButtons>
        <MultiBtn skin="default" onClick={addRecipient}>
          <Icon icon={plusIcon} style={{ fontSize: '.8em' }} />
          <span className="v-align ml0_4">{__('Add recipient')}</span>
        </MultiBtn>
        <SendBtn type="submit" skin="primary">
          <Icon icon={sendIcon} className="mr0_4" />
          {__('Proceed')}
        </SendBtn>
      </SendFormButtons>
    </SendFormComponent>
  );
}

export default connect(mapStateToProps)(reduxForm(reduxFormOptions)(SendForm));
