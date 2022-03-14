// External
import { useRef } from 'react';
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
  const prevValuesRef = useRef(null);
  const amountFieldName = parentFieldName
    ? parentFieldName + '.amount'
    : 'amount';
  const fiatAmountFieldName = parentFieldName
    ? parentFieldName + '.fiatAmount'
    : 'fiatAmount';

  let cascading = false;
  const valuesChanged = ({ values }) => {
    if (prevValuesRef.current) {
      const amount = getIn(values, amountFieldName);
      const fiatAmount = getIn(values, fiatAmountFieldName);
      const oldAmount = getIn(prevValuesRef.current, amountFieldName);
      const oldFiatAmount = getIn(prevValuesRef.current, fiatAmountFieldName);
      if (amount !== oldAmount) {
        if (cascading) {
          cascading = false;
        } else if (floatRegex.test(amount)) {
          const nxs = parseFloat(amount);
          if (price) {
            const fiat = nxs * price;
            form.change(fiatAmountFieldName, fiat.toFixed(2));
            cascading = true;
          }
        }
      } else if (fiatAmount !== oldFiatAmount) {
        if (cascading) {
          cascading = false;
        } else if (floatRegex.test(fiatAmount)) {
          const fiat = parseFloat(fiatAmount);
          if (price) {
            const nxs = fiat / price;
            form.change(amountFieldName, nxs.toFixed(6));
            cascading = true;
          }
        }
      }
    }
    prevValuesRef.current = values;
  };

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
          <Form.TextField name={fiatAmountFieldName} placeholder="0.00" />
        </FormField>
      </SendAmountField>

      <Form.Spy subscription={{ values: true }} onChange={valuesChanged} />
    </SendAmount>
  );
}
