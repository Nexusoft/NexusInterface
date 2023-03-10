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
import { useFieldValue, required, checkAll } from 'lib/form';
import { callApi } from 'lib/tritiumApi';
import { selectAddressNameMap, selectSource } from 'lib/send';
import memoize from 'utils/memoize';
import { debounced } from 'utils/universal';
import { addressRegex } from 'consts/misc';
import plusIcon from 'icons/plus.svg';
import addressBookIcon from 'icons/address-book.svg';
import walletIcon from 'icons/wallet.svg';
import warningIcon from 'icons/warning.svg';

import { getRecipientSuggestions } from './selectors';
import RecipientAddress from './RecipientAddress';

__ = __context('Send');

const RecipientName = styled.span(({ theme }) => ({
  textTransform: 'none',
  color: theme.primary,
}));

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

const notSameAccount = (value, { sendFrom }) =>
  value === sendFrom ? __('Cannot move to the same account') : undefined;

const validateRecipient = (source) =>
  async function (address) {
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
        return __('Invalid name/address');
      }
    }

    // Check if recipient is on the same token as source
    const sourceToken = source?.account?.token || source?.token?.address;
    if (sourceToken !== address) {
      let account;
      try {
        account = await callApi('finance/get/any', params);
        console.log(params, account);
      } catch (err) {
        let token;
        try {
          token = await callApi('tokens/get/token', params);
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

function RecipientLabel({ fieldName }) {
  const address = useFieldValue(fieldName);
  const addressNameMap = useSelector(selectAddressNameMap);

  const addressLabel = addressNameMap[address];
  const isAddress = addressRegex.test(address);

  const addToContact = async () => {
    let isMine = false;
    try {
      const result = await callApi('system/validate/address', {
        address,
      });
      isMine = result.mine;
    } catch (err) {
      console.error(err);
    }
    const prefill = isMine
      ? { notMine: [], mine: [{ address, label: '' }] }
      : { notMine: [{ address, label: '' }] };
    openModal(AddEditContactModal, { prefill });
  };

  return (
    <>
      <span>
        {__('Send to')}
        &nbsp;&nbsp;
      </span>
      {!!addressLabel && (
        <RecipientName>
          {addressLabel.type === 'contact' && (
            <Icon icon={addressBookIcon} className="mr0_4" />
          )}
          {addressLabel.type === 'account' && (
            <Icon icon={walletIcon} className="mr0_4" />
          )}
          <span className="v-align">{addressLabel.label}</span>
        </RecipientName>
      )}
      {!addressLabel && isAddress && (
        <Button skin="plain-link-primary" onClick={addToContact}>
          <Icon icon={plusIcon} style={{ fontSize: '0.9em' }} />
          <span className="v-align ml0_4">{__('Add to Address Book')}</span>
        </Button>
      )}
    </>
  );
}

const resolveName = async (name, callback) => {
  try {
    const { register } = await callApi('names/get/name', { name });
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
      <RecipientAddress address={address} />
      {!!error && (
        <div>
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
    input: { value: nameOrAddress, onChange },
    meta,
  } = useField(fieldName, {
    validate: checkAll(
      required(),
      notSameAccount
      // validateRecipient(source)
    ),
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
          render={({ input: { value, onChange }, meta: { error } }) => (
            <RecipientAddressAdapter
              nameOrAddress={nameOrAddress}
              justSelected={justSelectedRef.current}
              address={value}
              setAddress={onChange}
              validate={checkAll(
                required(__('Recipient name cannot be resolved')),
                notSameAccount
              )}
              error={error}
            />
          )}
        />
      </div>
    </FormField>
  );
}
