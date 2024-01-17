// External
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Field, useField } from 'react-final-form';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Icon from 'components/Icon';
import AddEditContactModal from 'components/AddEditContactModal';
import { openModal } from 'lib/ui';
import { required, checkAll } from 'lib/form';
import { callAPI } from 'lib/api';
import { selectSource } from 'lib/send';
import memoize from 'utils/memoize';
import { debounced } from 'utils/universal';
import { addressRegex } from 'consts/misc';
import plusIcon from 'icons/plus.svg';
import warningIcon from 'icons/warning.svg';

import { getRecipientSuggestions } from './selectors';
import RecipientAddress from './RecipientAddress';

__ = __context('Send');

const EmptyMessage = styled.div(({ theme }) => ({
  fontSize: '.9em',
  color: theme.mixer(0.625),
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const filterSuggestions = memoize((suggestions, inputValue) => {
  if (!suggestions) return [];
  if (!inputValue) return suggestions;
  const query = inputValue.toLowerCase();
  return suggestions.filter(
    ({ address, name }) =>
      (!!name && name.toLowerCase().includes(query)) ||
      (!!address && address.toLowerCase().includes(query))
  );
});

const notSameAccount = (value, { sendFrom }) => {
  let sourceAddress;
  if (sendFrom?.startsWith('account:')) {
    sourceAddress = sendFrom.substring(8);
  } else if (sendFrom?.startsWith('token:')) {
    sourceAddress = sendFrom.substring(6);
  }

  if (value === sourceAddress) {
    return __('Cannot move to the same account');
  }
  return undefined;
};

const isOfSameToken = (source) =>
  async function (address) {
    const sourceToken = source?.account?.token || source?.token?.address;
    if (sourceToken !== address) {
      let account;
      try {
        account = await callAPI('finance/get/any', { address });
      } catch (err) {
        let token;
        try {
          token = await callAPI('tokens/get/token', params);
        } catch {}
        if (token && token.address !== sourceToken) {
          return __('Source and recipient must be of the same token');
        }
      }
      if (account && account?.token !== sourceToken) {
        return __('Source and recipient must be of the same token');
      }
    }
  };

function createContact() {
  openModal(AddEditContactModal);
}

const resolveName = async (name, callback) => {
  try {
    const result = await callAPI('names/get/name', { name });
    const { register } = result;
    callback(register);
  } catch (err) {
    callback(null);
  }
};

const debouncedResolveName = debounced(resolveName, 500);

function RecipientAddressAdapter({
  nameOrAddress,
  address,
  setAddress,
  error,
  justSelected,
}) {
  useEffect(() => {
    if (addressRegex.test(nameOrAddress)) {
      // Treat nameOrAddress as an address
      setAddress(nameOrAddress);
    } else {
      // Treat nameOrAddress as a name
      // Temporarily clear the old address before the name is resolved
      setAddress(null);
      if (nameOrAddress) {
        if (justSelected) {
          // Resolve name immediately if user selected a suggestion
          debouncedResolveName.cancel();
          resolveName(nameOrAddress, setAddress);
        } else {
          // Resolve name whenever user stops typing for 0.5s
          debouncedResolveName(nameOrAddress, setAddress);
        }
      }
    }
  }, [nameOrAddress]);

  return (
    <div>
      <RecipientAddress address={address} className="mb0_4" />
      {!!error && (
        <div className="error">
          <Icon icon={warningIcon} className="mr0_4" />
          <span className="v-align">{error}</span>
        </div>
      )}
    </div>
  );
}

export default function RecipientNameOrAddress({ parentFieldName }) {
  const fieldName = `${parentFieldName}.nameOrAddress`;
  const {
    input: { value: nameOrAddress, onChange, ...inputRest },
    meta,
  } = useField(fieldName, {
    validate: required(),
  });
  // A flag indicating whether user has just selected the suggestion
  // Useful to decide if name resolution should be debounced
  const justSelectedRef = useRef(false);
  const source = selectSource();
  const suggestions = useSelector((state) =>
    getRecipientSuggestions(state, source)
  );

  return (
    <FormField label={__('Send to')}>
      <AutoSuggest
        inputProps={{
          ...inputRest,
          value: nameOrAddress,
          onChange: (...args) => {
            justSelectedRef.current = false;
            onChange(...args);
          },
          error: meta.touched && meta.error,
          placeholder: __('Recipient Name or Address'),
          skin: 'filled-inverted',
        }}
        onSelect={(...args) => {
          justSelectedRef.current = true;
          onChange(...args);
        }}
        suggestions={suggestions}
        filterSuggestions={filterSuggestions}
        emptyFiller={
          suggestions.length === 0 && (
            <EmptyMessage>
              {__('Your address book is empty')}
              <Button as="a" skin="hyperlink" onClick={createContact}>
                <Icon
                  icon={plusIcon}
                  className="mr0_4"
                  style={{ fontSize: '.8em' }}
                />
                <span className="v-align">{__('Create new contact')}</span>
              </Button>
            </EmptyMessage>
          )
        }
      />
      <div className="mt1">
        <Field
          name={`${parentFieldName}.address`}
          validate={checkAll(
            required(__('Recipient name cannot be resolved')),
            notSameAccount,
            isOfSameToken(source)
          )}
          render={({ input: { value, onChange }, meta: { error } }) => (
            <RecipientAddressAdapter
              nameOrAddress={nameOrAddress}
              justSelected={justSelectedRef.current}
              address={value}
              setAddress={onChange}
              error={nameOrAddress ? error : null}
            />
          )}
        />
      </div>
    </FormField>
  );
}
