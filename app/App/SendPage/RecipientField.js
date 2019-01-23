// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import memoize from 'memoize-one';
import styled from '@emotion/styled';

// Internal Global
import * as RPC from 'scripts/rpc';
import { loadMyAccounts } from 'actions/accountActionCreators';
import Text from 'components/Text';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import AutoSuggest from 'components/AutoSuggest';
import Select from 'components/Select';
import FormField from 'components/FormField';
import InputGroup from 'components/InputGroup';
import UIController from 'components/UIController';
import Link from 'components/Link';
import { rpcErrorHandler } from 'utils/form';
import sendIcon from 'images/send.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';

// Internal Local
import { getAddressNameMap, getRecipientSuggestions } from './selectors';

const RecipientName = styled.span(({ theme }) => ({
  textTransform: 'none',
  color: theme.primary,
  verticalAlign: 'middle',
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
  render() {
    const recipientName = this.props.addressNameMap[this.props.input.value];

    return (
      <FormField
        label={
          <span>
            <span className="v-align">Send To</span>&nbsp;&nbsp;
            <RecipientName>{recipientName}</RecipientName>
          </span>
        }
      >
        <AutoSuggest.RF
          input={this.props.input}
          meta={this.props.meta}
          inputProps={{ placeholder: 'Recipient Address' }}
          suggestions={this.props.suggestions}
          onSelect={this.props.updateRecipient}
          filterSuggestions={filterRecipients}
        />
      </FormField>
    );
  }
}
