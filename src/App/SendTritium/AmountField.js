// External
import { Component } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Link from 'components/Link';
import TokenName from 'components/TokenName';

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

export default function AmountField({ source, parentFieldName, fullAmount }) {
  // const fiatCurrency = useSelector(state => state.settings.fiatCurrency)
  // const price = useSelector(state => state.market?.price)

  // const nxsToFiat = (e, value) => {
  //   if (floatRegex.test(value)) {
  //     const nxs = parseFloat(value);
  //     const { nxsFiatPrice } = this.props;
  //     if (nxsFiatPrice) {
  //       const fiat = nxs * nxsFiatPrice;
  //       this.props.change(this.fiatAmountFieldName(), fiat.toFixed(2));
  //     }
  //   }
  // };

  // /**
  //  * Returns the fiat from NXS
  //  *
  //  * @memberof AmountField
  //  */
  // fiatToNxs = (e, value) => {
  //   if (floatRegex.test(value)) {
  //     const fiat = parseFloat(value);
  //     const { nxsFiatPrice } = this.props;
  //     if (nxsFiatPrice) {
  //       const nxs = fiat / nxsFiatPrice;
  //       this.props.change(this.amountFieldName(), nxs.toFixed(5));
  //     }
  //   }
  // };

  const amountFieldName = () =>
    (parentFieldName ? parentFieldName + '.' : '') + 'amount';

  const sendAll = (evt) => {
    evt.preventDefault();
    change(amountFieldName(), fullAmount);
    // nxsToFiat(null, fullAmount);
  };

  return (
    <SendAmount>
      <SendAmountField>
        <FormField
          connectLabel
          label={
            <span style={{ whiteSpace: 'nowrap' }}>
              <span className="v-align">
                {__('Amount')}
                {!!source && (
                  <span>
                    &nbsp;(
                    {source.token ? (
                      <TokenName token={source.token} />
                    ) : (
                      <TokenName account={source.account} />
                    )}
                    )
                  </span>
                )}
              </span>
              {!!fullAmount && (
                <SendAllLink as="a" onClick={sendAll}>
                  {__('Send all')}
                </SendAllLink>
              )}
            </span>
          }
        >
          <Field
            component={TextField.RF}
            skin="filled-inverted"
            name={amountFieldName()}
            placeholder="0.00000"
          />
        </FormField>
      </SendAmountField>

      {/* {token.address === '0' ? (
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
        ) : null} */}
    </SendAmount>
  );
}
