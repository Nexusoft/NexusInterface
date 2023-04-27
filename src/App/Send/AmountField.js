// External
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-final-form';
import { getIn } from 'final-form';
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import FormField from 'components/FormField';
import Link from 'components/Link';
import { subtract } from 'utils/calc';
import { useFieldValue } from 'lib/form';

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

function SendAll({ amountFieldName, form }) {
  const sendFrom = useFieldValue('sendFrom');
  const amount = useFieldValue(amountFieldName);
  const myAccounts = useSelector((state) => state.myAccounts);
  const account = myAccounts.find((acc) => acc.account === sendFrom);
  const fullAmount = subtract(account?.balance, 0.01);
  const hidden = !fullAmount || amount === fullAmount;

  return (
    !hidden && (
      <SendAllLink
        as="a"
        onClick={(evt) => {
          evt.preventDefault();
          form.change(amountFieldName, fullAmount);
        }}
      >
        {__('Send all')}
      </SendAllLink>
    )
  );
}

function positiveNumber(value) {
  const floatAmount = parseFloat(value);
  if (!floatAmount || floatAmount < 0) {
    return __('Invalid amount');
  }
}

export default function AmountField({ parentFieldName = '', hideSendAll }) {
  const price = useSelector((state) => state.market?.price);
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const form = useForm();
  const amountFieldName = parentFieldName
    ? parentFieldName + '.amount'
    : 'amount';
  const fiatAmountFieldName = parentFieldName
    ? parentFieldName + '.fiatAmount'
    : 'fiatAmount';

  const prevValuesRef = useRef(null);
  const cascadingRef = useRef(false);
  useEffect(() =>
    form.subscribe(
      ({ values }) => {
        if (prevValuesRef.current) {
          const amount = getIn(values, amountFieldName);
          const fiatAmount = getIn(values, fiatAmountFieldName);
          const oldAmount = getIn(prevValuesRef.current, amountFieldName);
          const oldFiatAmount = getIn(
            prevValuesRef.current,
            fiatAmountFieldName
          );
          if (amount !== oldAmount) {
            if (cascadingRef.current) {
              cascadingRef.current = false;
            } else if (floatRegex.test(amount) && price) {
              const nxs = parseFloat(amount);
              const fiat = nxs * price;
              form.change(fiatAmountFieldName, fiat.toFixed(2));
              cascadingRef.current = true;
            }
          } else if (fiatAmount !== oldFiatAmount) {
            if (cascadingRef.current) {
              cascadingRef.current = false;
            } else if (floatRegex.test(fiatAmount) && price) {
              const fiat = parseFloat(fiatAmount);
              const nxs = fiat / price;
              form.change(amountFieldName, nxs.toFixed(6));
              cascadingRef.current = true;
            }
          }
        }
        prevValuesRef.current = values;
      },
      { values: true }
    )
  );

  return (
    <SendAmount>
      <SendAmountField>
        <FormField
          connectLabel
          label={
            <>
              <span className="v-align">{__('NXS Amount')}</span>
              {!hideSendAll && (
                <SendAll amountFieldName={amountFieldName} form={form} />
              )}
            </>
          }
        >
          <Form.TextField
            name={amountFieldName}
            placeholder="0.00000"
            config={{
              format: (value, name) => {
                return value ? value.replace(',', '.') : '';
              },
            }}
            validate={positiveNumber}
          />
        </FormField>
      </SendAmountField>

      <SendAmountEqual>=</SendAmountEqual>

      <SendAmountField>
        <FormField
          connectLabel
          label={__('%{currency} amount', { currency: fiatCurrency })}
        >
          <Form.TextField
            name={fiatAmountFieldName}
            config={{
              format: (value, name) => {
                return value ? value.replace(',', '.') : '';
              },
            }}
            placeholder="0.00"
          />
        </FormField>
      </SendAmountField>
    </SendAmount>
  );
}
