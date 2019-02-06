// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import { getNxsFiatPrice } from './selectors';

const floatRegex = /^[0-9]+(.[0-9]*)?$/;

const SendAmount = styled.div({
  display: 'flex',
});

const SendAmountField = styled.div({
  flex: 1,
});

const SendAmountEqual = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '.1em .6em',
  fontSize: '1.2em',
});

const mapStateToProps = ({
  settings: { fiatCurrency },
  common: { rawNXSvalues },
}) => ({
  fiatCurrency: fiatCurrency,
  nxsFiatPrice: getNxsFiatPrice(rawNXSvalues, fiatCurrency),
});

/**
 * The Amount Feild on the Send Page
 *
 * @class AmountField
 * @extends {Component}
 */
@connect(mapStateToProps)
class AmountField extends Component {
  /**
   * Convert the NXS to the User's currency
   *
   * @memberof AmountField
   */
  nxsToFiat = (e, value) => {
    if (floatRegex.test(value)) {
      const nxs = parseFloat(value);
      const { nxsFiatPrice } = this.props;
      if (nxsFiatPrice) {
        const fiat = nxs * nxsFiatPrice;
        this.props.change(this.fiatAmountFieldName(), fiat.toFixed(2));
      }
    }
  };

  /**
   * Returns the fiat from NXS
   *
   * @memberof AmountField
   */
  fiatToNxs = (e, value) => {
    if (floatRegex.test(value)) {
      const fiat = parseFloat(value);
      const { nxsFiatPrice } = this.props;
      if (nxsFiatPrice) {
        const nxs = fiat / nxsFiatPrice;
        this.props.change(this.amountFieldName(), nxs.toFixed(5));
      }
    }
  };

  /**
   * Returns the Amount Feild Name
   *
   * @memberof AmountField
   */
  amountFieldName = () =>
    (this.props.parentFieldName ? this.props.parentFieldName + '.' : '') +
    'amount';
  /**
   * Returns the Fiat Amount Name
   *
   * @memberof AmountField
   */
  fiatAmountFieldName = () =>
    (this.props.parentFieldName ? this.props.parentFieldName + '.' : '') +
    'fiatAmount';

  /**
   * React Render
   *
   * @returns
   * @memberof AmountField
   */
  render() {
    return (
      <SendAmount>
        <SendAmountField>
          <FormField
            connectLabel
            label={
              <span className="v-align">
                <Text id="sendReceive.Amount" />
              </span>
            }
          >
            <Field
              component={TextField.RF}
              name={this.amountFieldName()}
              placeholder="0.00000"
              onChange={this.nxsToFiat}
            />
          </FormField>
        </SendAmountField>

        <SendAmountEqual>=</SendAmountEqual>

        <SendAmountField>
          <FormField connectLabel label={this.props.fiatCurrency}>
            <Field
              component={TextField.RF}
              name={this.fiatAmountFieldName()}
              placeholder="0.00"
              onChange={this.fiatToNxs}
            />
          </FormField>
        </SendAmountField>
      </SendAmount>
    );
  }
}
export default AmountField;