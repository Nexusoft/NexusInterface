// External
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { connect } from 'react-redux';
import memoize from 'utils/memoize';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { openModal } from 'lib/ui';
import AddEditContactModal from 'components/AddEditContactModal';
import plusIcon from 'icons/plus.svg';
import { getAddressNameMap, getRecipientSuggestions } from './selectors';
import { formatNumber } from 'lib/intl';

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

const ItemLine = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto 8em 5em 10em',
  gridTemplateRows: 'auto',
  gridGap: '1em 1em',
});

const TotalField = styled.div({
  width: '10em',
  position: 'relative',
  top: '100%',
  marginTop: '-1.5em',
});

/**
 * The Recipient Field in the Send Page
 *
 * @class RecipientField
 * @extends {Component}
 */
class InvoiceItem extends Component {
  /**
   *Handle Select Address
   *
   * @memberof RecipientField
   */
  handleSelect = address => {
    this.props.change(this.props.input.name, address);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof RecipientField
   */
  render() {
    console.log(this.props);
    const { input, meta } = this.props;

    const total = input.value && input.value.unitPrice * input.value.units;
    console.log(total);

    return (
      <ItemLine input={input} meta={meta}>
        {' '}
        <FormField>
          <Field
            component={TextField.RF}
            name={`${input.name}.description`}
            placeholder="Description"
          />
        </FormField>
        <FormField>
          <Field
            component={TextField.RF}
            name={`${input.name}.unitPrice`}
            type="number"
            placeholder="Unit Costs"
          />
        </FormField>
        <FormField>
          <Field
            component={TextField.RF}
            name={`${input.name}.units`}
            type="number"
            placeholder="Units"
          />
        </FormField>
        <TotalField> {`${formatNumber(total, 6)} NXS`}</TotalField>
      </ItemLine>
    );
  }
}
export default InvoiceItem;
