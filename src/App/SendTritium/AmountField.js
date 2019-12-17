// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Link from 'components/Link';
import { getNxsFiatPrice } from './selectors';
import Tooltip from 'components/Tooltip';

__ = __context('Send');

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

const SendAllLink = styled(Link)({
  textTransform: 'uppercase',
  marginLeft: '1em',
  fontSize: '.9em',
  verticalAlign: 'middle',
});

const TokenAddress = styled.a(({ theme }) => ({
  textTransform: 'none',
  marginLeft: '1em',
  color: theme.mixer(0.5),
}));

const mapStateToProps = ({
  settings: { fiatCurrency },
  market: {
    cryptocompare: { rawNXSvalues },
  },
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

  sendAll = evt => {
    evt.preventDefault();
    const { change, fullAmount } = this.props;
    change(this.amountFieldName(), fullAmount);
    this.nxsToFiat(null, fullAmount);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof AmountField
   */
  render() {
    const token = this.props.token;
    return (
      <SendAmount>
        <SendAmountField>
          <FormField
            connectLabel
            label={
              <>
                <span className="v-align">
                  {__('%{tokenName} Amount', {
                    tokenName: token.name || 'Token',
                  })}
                </span>
                {!token.name && <TokenAddress> {token.address} </TokenAddress>}
                {!!this.props.fullAmount && (
                  <SendAllLink as="a" onClick={this.sendAll}>
                    {__('Send all')}
                  </SendAllLink>
                )}
              </>
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

        {token.address === '0' ? (
          <>
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
          </>
        ) : null}
      </SendAmount>
    );
  }
}
export default AmountField;
