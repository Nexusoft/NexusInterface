// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
import Text, { translate } from 'components/Text';
import { getAddressNameMap, getRecipientSuggestions } from './selectors';

const RecipientName = styled.span(({ theme }) => ({
  textTransform: 'none',
  color: theme.primary,
}));

const filterRecipients = memoize((suggestions, inputValue) => {
  if (!suggestions) return [];
  const query = new String(inputValue || '').toLowerCase();
  return suggestions.filter(({ value, name }) => {
    return (
      (!!value && value.toLowerCase().includes(query)) ||
      (!!name && name.toLowerCase().includes(query))
    );
  });
});

const mapStateToProps = ({
  addressbook: { addressbook },
  settings: { locale },
}) => ({
  suggestions: getRecipientSuggestions(addressbook),
  addressNameMap: getAddressNameMap(addressbook),
  locale,
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
   * React Render
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
              <Text id="sendReceive.SendTo" />
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
        />
      </FormField>
    );
  }
}
export default RecipientField;