// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
import Text, { translate } from 'components/Text';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { openModal } from 'actions/overlays';
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

const mapStateToProps = ({ addressBook, settings: { locale } }) => ({
  suggestions: getRecipientSuggestions(addressBook),
  addressNameMap: getAddressNameMap(addressBook),
  locale,
});

const actionCreators = { openModal };

/**
 * The Recipient Field in the Send Page
 *
 * @class RecipientField
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
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
    this.props.openModal(AddEditContactModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof RecipientField
   */
  render() {
    const { addressNameMap, input, meta, locale, suggestions } = this.props;
    const recipientName = addressNameMap[input.value];

    return (
      <FormField
        label={
          <>
            <span>
              _`Send to`
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
            placeholder: translate('sendReceive.RecipientAddress', locale),
          }}
          suggestions={suggestions}
          onSelect={this.handleSelect}
          filterSuggestions={filterRecipients}
          emptyFiller={
            suggestions.length === 0 && (
              <EmptyMessage>
                _`Your address book is empty.`
                <Button as="a" skin="hyperlink" onClick={this.createContact}>
                  <Icon
                    icon={plusIcon}
                    className="space-right"
                    style={{ fontSize: '.8em' }}
                  />
                  _`Create new contact`
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
