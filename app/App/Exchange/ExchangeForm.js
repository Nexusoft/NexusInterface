// External
import React, { Component } from 'react';
import Text from 'components/Text';
import styled from '@emotion/styled';

// Internal
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import Select from 'components/Select';

const ExchangeFormComponent = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: 20,
  padding: '0 calc(20% - 150px)',
});

/**
 * Internal form for use in the Exchange page
 *
 * @export
 * @class ExchangeForm
 * @extends {Component}
 */
export default class ExchangeForm extends Component {
  /**
   * Sets the To and From Values
   *
   * @param {*} value
   * @param {*} switcher
   * @memberof ExchangeForm
   */
  toFromHandler(value, switcher) {
    if (switcher === 'to') {
      if (value !== this.props.from) {
        this.props.setBusyFlag();
        this.props.ToSetter(value);
      } else {
        this.props.ToSetter(value);
      }
    } else {
      if (value !== this.props.to) {
        this.props.setBusyFlag();
        this.props.FromSetter(value);
      } else {
        this.props.FromSetter(value);
      }
    }
  }

  /**
   * Build out the array of available 
   *
   * @returns
   * @memberof ExchangeForm
   */
  optionbuilder() {
    return Object.values(this.props.availableCoins)
      .filter(e => e.status === 'available')
      .map(e => ({ value: e.symbol, display: e.name }));
  }

  /**
   * Returns the min amount a user has to send
   *
   * @returns
   * @memberof ExchangeForm
   */
  minAmount() {
    if (this.props.marketPairData.minimum) {
      return this.props.marketPairData.minimum;
    } else return 0;
  }

  /**
   * Handle the amount 
   *
   * @param {*} value
   * @returns
   * @memberof ExchangeForm
   */
  amountHandler(value) {
    if (/^[0-9.]+$/.test(value) | (value === '')) {
      this.props.ammountUpdater(value);
    } else {
      return null;
    }
  }

  /**
   * Return the Currency lable 
   *
   * @returns
   * @memberof ExchangeForm
   */
  currencylabel() {
    return this.props.to ? this.props.availableCoins[this.props.to].name : null;
  }

  render() {
    return (
      <ExchangeFormComponent>
        <FieldSet legend={<Text id="Exchange.Send" />}>
          <Select
            value={this.props.from}
            onChange={e => this.toFromHandler(e, 'from')}
            options={this.optionbuilder()}
          />
          <Text id="Exchange.MinTrade">
            {text => (
              <FormField
                connectLabel
                label={<Text id="Exchange.TradeAmount" />}
              >
                <TextField
                  placeholder={`${this.minAmount()} ${this.props.from} ${text}`}
                  value={this.props.ammount}
                  onChange={e => this.amountHandler(e.target.value)}
                  required
                />
              </FormField>
            )}
          </Text>
          {this.props.from !== 'NXS' && (
            <FormField
              connectLabel
              label={<Text id="Exchange.RefundAddress" />}
            >
              <TextField
                value={this.props.refundAddress}
                onChange={e => this.props.refundAddressSetter(e.target.value)}
                required
              />
            </FormField>
          )}
        </FieldSet>
        <FieldSet legend={<Text id="Exchange.Receive" />}>
          <Select
            onChange={e => this.toFromHandler(e, 'to')}
            value={this.props.to}
            options={this.optionbuilder()}
          />

          <FormField
            connectLabel
            label={
              <span>
                {this.currencylabel()} <Text id="Footer.Address" />
              </span>
            }
          >
            <TextField
              value={this.props.toAddress}
              onChange={e => this.props.toAddressSetter(e.target.value)}
              required
            />
          </FormField>
        </FieldSet>
      </ExchangeFormComponent>
    );
  }
}
