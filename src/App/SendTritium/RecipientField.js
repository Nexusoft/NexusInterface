// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import memoize from 'utils/memoize';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { openModal } from 'lib/ui';
import AddEditContactModal from 'components/AddEditContactModal';
import plusIcon from 'images/plus.sprite.svg';
import { getAddressNameMap, getRecipientSuggestions } from './selectors';

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

const mapStateToProps = ({ addressBook, core }) => ({
  suggestions: getRecipientSuggestions(addressBook, core.accounts),
  addressNameMap: getAddressNameMap(addressBook, core.accounts),
});

/**
 * The Recipient Field in the Send Page
 *
 * @class RecipientField
 * @extends {Component}
 */
@connect(mapStateToProps)
class RecipientField extends Component {
  /**
   *Handle Select Address
   *
   * @memberof RecipientField
   */
  handleSelect = address => {
    this.props.change(this.props.input.name, address);
  };

  /**
   * Opens the Add/Edit Contact Modal
   *
   * @memberof RecipientField
   */
  createContact = () => {
    openModal(AddEditContactModal);
  };

  returnFilteredSuggestions(suggestions) {
    return suggestions.filter(
      account =>
        account.token === this.props.sendFrom.token &&
        account.name !== this.props.sendFrom.name
    );
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof RecipientField
   */
  render() {
    const { addressNameMap, input, meta } = this.props;
    const recipientName = addressNameMap[input.value];
    const suggestions = this.returnFilteredSuggestions(this.props.suggestions);
    return (
      <FormField
        label={
          <>
            <span>
              {__('Send to')}
              &nbsp;&nbsp;
            </span>
            <RecipientName>{recipientName}</RecipientName>
          </>
        }
      >
        <AutoSuggest.RF
          input={input}
          meta={meta}
          inputProps={{
            placeholder: __('Recipient Address/Name'),
          }}
          suggestions={suggestions}
          onSelect={this.handleSelect}
          filterSuggestions={filterRecipients}
          emptyFiller={
            suggestions.length === 0 && (
              <EmptyMessage>
                {__('Your address book is empty')}
                <Button as="a" skin="hyperlink" onClick={this.createContact}>
                  <Icon
                    icon={plusIcon}
                    className="space-right"
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
}
export default RecipientField;
