// External
import React from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';
import RecipientField from '../SendTritium/RecipientField';
import InvoiceItem from './invoiceItem';
import AmountField from '../SendTritium/AmountField';
import { subtract } from 'utils/calc';

/**
 * Each Invoice Item  on the Invoice Page list
 *
 * @class RecipientField
 * @extends {Component}
 */
class Invoice extends Component {
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
    const { input, meta } = this.props;
    const total = input.value && input.value.unitPrice * input.value.units;

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
        <TotalField
          disabled={true}
          value={`${formatNumber(total, 6)} NXS`}
        ></TotalField>
      </ItemLine>
    );
  }
}

export default Invoice;
