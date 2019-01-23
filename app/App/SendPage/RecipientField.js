// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
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

const mapStateToProps = ({ addressbook: { addressbook } }) => ({
  suggestions: getRecipientSuggestions(addressbook),
  addressNameMap: getAddressNameMap(addressbook),
});

@connect(mapStateToProps)
export default class RecipientField extends Component {
  handleSelect = address => {
    this.props.change(this.props.input.name, address);
  };

  render() {
    const recipientName = this.props.addressNameMap[this.props.input.value];

    return (
      <FormField
        label={
          <>
            <span>Send To&nbsp;&nbsp;</span>
            <RecipientName>{recipientName}</RecipientName>
          </>
        }
      >
        <AutoSuggest.RF
          input={this.props.input}
          meta={this.props.meta}
          inputProps={{ placeholder: 'Recipient Address' }}
          suggestions={this.props.suggestions}
          onSelect={this.handleSelect}
          filterSuggestions={filterRecipients}
        />
      </FormField>
    );
  }
}
