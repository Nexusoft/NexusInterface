// External
import { useSelector } from 'react-redux';
import memoize from 'utils/memoize';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Icon from 'components/Icon';
import AddEditContactModal from 'components/AddEditContactModal';
import { openModal } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';
import { addressRegex } from 'consts/misc';
import plusIcon from 'icons/plus.svg';
import { getAddressNameMap, getRecipientSuggestions } from './selectors';

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

function createContact() {
  openModal(AddEditContactModal);
}

export default function RecipientField({ source, change, input, meta }) {
  const suggestions = useSelector(({ addressBook, user }) =>
    getRecipientSuggestions(
      addressBook,
      user?.accounts.filter((e) => e.token === source?.account?.token),
      source?.account?.address
    )
  );
  const addressNameMap = useSelector(({ addressBook, user }) =>
    getAddressNameMap(addressBook, user?.accounts)
  );

  const recipientName = addressNameMap[input.value];
  const isAddress = addressRegex.test(input.value);

  const handleSelect = (address) => {
    change(input.name, address);
  };

  const addToContact = async () => {
    const address = input.value;
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
    <FormField
      label={
        <>
          <span>
            {__('Send to')}
            &nbsp;&nbsp;
          </span>
          <RecipientName>{recipientName}</RecipientName>
          {!recipientName && isAddress && (
            <Button skin="plain-link-primary" onClick={addToContact}>
              <Icon icon={plusIcon} style={{ fontSize: '0.9em' }} />
              <span className="v-align ml0_4">{__('Add to Address Book')}</span>
            </Button>
          )}
        </>
      }
    >
      <AutoSuggest.RF
        input={input}
        meta={meta}
        inputProps={{
          placeholder: __('Recipient Address/Name'),
          skin: 'filled-inverted',
        }}
        suggestions={suggestions}
        onSelect={handleSelect}
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
    </FormField>
  );
}
