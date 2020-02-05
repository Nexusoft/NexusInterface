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

__ = __context('Invoice Item');

const ItemLine = styled.div({
  display: 'grid',
  gridTemplateColumns: '1em auto 8em 5em 10em',
  gridTemplateRows: 'auto',
  gridGap: '1em 1em',
});

const TotalField = styled(TextField)({
  width: '10em',
  position: 'relative',
  top: '100%',
  marginTop: '-2.25em',
  input: {
    textAlign: 'right',
  },
});

/**
 * Each item in the  invoice
 *
 * @class RecipientField
 * @extends {Component}
 */
class InvoiceItem extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof RecipientField
   */
  render() {
    const { input, meta, child } = this.props;
    const total = input.value && input.value.unitPrice * input.value.units;

    return (
      <ItemLine input={input} meta={meta}>
        {' '}
        {child}
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
        <TotalField
          disabled={true}
          value={`${formatNumber(total, 6)} NXS`}
        ></TotalField>
      </ItemLine>
    );
  }
}
export default InvoiceItem;
