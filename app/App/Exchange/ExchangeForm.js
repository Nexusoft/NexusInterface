// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
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

export default class ExchangeForm extends Component {
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

  optionbuilder() {
    return Object.values(this.props.availableCoins)
      .filter(e => e.status === 'available')
      .map(e => ({ value: e.symbol, display: e.name }));
  }

  minAmount() {
    if (this.props.marketPairData.minimum) {
      return this.props.marketPairData.minimum;
    } else return 0;
  }

  amountHandler(value) {
    if (/^[0-9.]+$/.test(value) | (value === '')) {
      this.props.ammountUpdater(value);
    } else {
      return null;
    }
  }

  currencylabel() {
    return this.props.to ? this.props.availableCoins[this.props.to].name : null;
  }

  render() {
    return (
      <ExchangeFormComponent>
        <FieldSet
          legend={<FormattedMessage id="Exchange.Send" defaultMessage="Send" />}
        >
          <Select
            value={this.props.from}
            onChange={e => this.toFromHandler(e, 'from')}
            options={this.optionbuilder()}
          />
          <FormattedMessage
            id="Exchange.MinTrade"
            defaultMessage="Minimum trade"
          >
            {text => (
              <FormField
                connectLabel
                label={
                  <FormattedMessage
                    id="Exchange.TradeAmount"
                    defaultMessage="Trade Amount"
                  />
                }
              >
                <TextField
                  placeholder={`${this.minAmount()} ${this.props.from} ${text}`}
                  value={this.props.ammount}
                  onChange={e => this.amountHandler(e.target.value)}
                  required
                />
              </FormField>
            )}
          </FormattedMessage>
          {this.props.from !== 'NXS' && (
            <FormField
              connectLabel
              label={
                <FormattedMessage
                  id="Exchange.RefundAddress"
                  defaultMessage="Refund Address"
                />
              }
            >
              <TextField
                value={this.props.refundAddress}
                onChange={e => this.props.refundAddressSetter(e.target.value)}
                required
              />
            </FormField>
          )}
        </FieldSet>
        <FieldSet
          legend={
            <FormattedMessage id="Exchange.Receive" defaultMessage="Receive" />
          }
        >
          <Select
            onChange={e => this.toFromHandler(e, 'to')}
            value={this.props.to}
            options={this.optionbuilder()}
          />

          <FormField
            connectLabel
            label={
              <span>
                {this.currencylabel()}{' '}
                <FormattedMessage
                  id="Footer.Address"
                  defaultMessage="Address"
                />
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
