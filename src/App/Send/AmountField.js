// External
import { useSelector } from 'react-redux';
import { useField, useForm } from 'react-final-form';
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import FormField from 'components/FormField';
import Link from 'components/Link';
import { subtract } from 'utils/calc';

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

function SendAll({ nxsToFiat, amountFieldName, form }) {
  const {
    input: { value: sendFrom },
  } = useField('sendFrom', { subscription: { value: true } });
  const {
    input: { value: amount },
  } = useField(amountFieldName, { subscription: { value: true } });
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
          nxsToFiat(fullAmount);
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

export default function AmountField({ parentFieldName = '' }) {
  const price = useSelector((state) => state.market?.price);
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const form = useForm();
  const amountFieldName = parentFieldName
    ? parentFieldName + '.amount'
    : 'amount';
  const fiatAmountFieldName = parentFieldName
    ? parentFieldName + '.fiatAmount'
    : 'fiatAmount';

  const nxsToFiat = (value) => {
    if (floatRegex.test(value)) {
      const nxs = parseFloat(value);
      if (price) {
        const fiat = nxs * price;
        form.change(fiatAmountFieldName, fiat.toFixed(2));
      }
    }
  };

  const fiatToNxs = (value) => {
    if (floatRegex.test(value)) {
      const fiat = parseFloat(value);
      if (price) {
        const nxs = fiat / price;
        form.change(amountFieldName, nxs.toFixed(6));
      }
    }
  };

  return (
    <SendAmount>
      <SendAmountField>
        <FormField
          connectLabel
          label={
            <>
              <span className="v-align">{__('NXS Amount')}</span>
              <SendAll
                nxsToFiat={nxsToFiat}
                amountFieldName={amountFieldName}
                form={form}
              />
            </>
          }
        >
          <Form.TextField
            name="amount"
            placeholder="0.00000"
            onChange={nxsToFiat}
            validate={positiveNumber}
          />
        </FormField>
      </SendAmountField>

      <SendAmountEqual>=</SendAmountEqual>

      <SendAmountField>
        <FormField connectLabel label={fiatCurrency}>
          <Form.TextField
            name="fiatAmount"
            placeholder="0.00"
            onChange={fiatToNxs}
          />
        </FormField>
      </SendAmountField>
    </SendAmount>
  );
}
