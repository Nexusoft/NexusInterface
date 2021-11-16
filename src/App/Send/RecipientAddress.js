// External
import { useSelector } from 'react-redux';
import memoize from 'utils/memoize';
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { openModal } from 'lib/ui';
import { checkAll, required } from 'lib/form';
import AddEditContactModal from 'components/AddEditContactModal';
import plusIcon from 'icons/plus.svg';
import {
  lookUpContactName,
  selectRecipientSuggestions,
  notSameAccount,
  validateAddress,
} from './selectors';

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

const filterRecipients = memoize((suggestions, inputValue) => {
  if (!suggestions) return [];
  const query = inputValue || '';
  return suggestions.filter(
    ({ value, name }) =>
      value === query ||
      (!!name && name.toLowerCase().includes(query.toLowerCase()))
  );
});

export default function RecipientAddress({ fieldName }) {
  const suggestions = useSelector(selectRecipientSuggestions);

  return (
    <FormField
      label={
        <>
          <span>
            {__('Send to')}
            &nbsp;&nbsp;
          </span>
          <RecipientName>
            <Form.Field name={fieldName} subscription={{ value: true }}>
              {({ input }) =>
                useSelector(lookUpContactName(input.value)) || null
              }
            </Form.Field>
          </RecipientName>
        </>
      }
    >
      <Form.AutoSuggest
        name={fieldName}
        validate={checkAll(required(), notSameAccount, validateAddress)}
        inputProps={{
          placeholder: __('Recipient address'),
        }}
        suggestions={suggestions}
        filterSuggestions={filterRecipients}
        emptyFiller={
          suggestions.length === 0 && (
            <EmptyMessage>
              {__('Your address book is empty')}
              <Button
                as="a"
                skin="hyperlink"
                onClick={() => {
                  openModal(AddEditContactModal);
                }}
              >
                <Icon
                  icon={plusIcon}
                  className="mr0_4"
                  style={{ fontSize: '.8em' }}
                />
                {__('Create new contact')}
              </Button>
            </EmptyMessage>
          )
        }
      />
    </FormField>
  );
}
