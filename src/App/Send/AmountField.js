// External
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-final-form';
import { getIn } from 'final-form';
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import FormField from 'components/FormField';
import Link from 'components/Link';
import TokenName from 'components/TokenName';
import { selectSource } from 'lib/send';

__ = __context('Send');

const floatRegex = /^[0-9]+(.[0-9]*)?$/;

const Wrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
});

const AmountFieldWrapper = styled.div({
  flex: '1 1 100px',
});

const FiatAmountFieldWrapper = styled.div({
  flex: '1 1 100px',
});

const SendAllLink = styled(Link)({
  textTransform: 'uppercase',
  marginLeft: '1em',
  fontSize: '.9em',
  verticalAlign: 'middle',
});

const EqualSign = styled.div(({ theme }) => ({
  flex: '0 0',
  display: 'flex',
  alignItems: 'flex-end',
  padding: '.1em .4em',
  marginTop: '2em',
  fontSize: '1.2em',
  color: theme.mixer(0.5),
}));

const nxsToFiat = (value, price) => {
  if (price) {
    if (floatRegex.test(value)) {
      const nxs = parseFloat(value);
      const fiat = nxs * price;
      return fiat.toFixed(2);
    }
  }
  return null;
};

function positiveNumber(value) {
  const floatAmount = parseFloat(value);
  if (!floatAmount || floatAmount < 0) {
    return __('Invalid amount');
  }
}

// function FiatValue({ fieldName, source }) {
//   const value = useFieldValue(fieldName);
//   const price = useSelector((state) => state.market?.price);
//   const currency = useSelector((state) => state.market?.currency);
//   const isInNXS = (source?.account?.token || source?.token?.address) === '0';
//   const fiat = isInNXS && nxsToFiat(value, price);

//   return fiat ? `≈ ${fiat} ${currency}` : null;
// }

export default function AmountField({ parentFieldName }) {
  const source = selectSource();
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const price = useSelector((state) => state.market?.price);
  const form = useForm();
  const fullAmount = (source?.account || source?.token)?.balance;
  const amountFieldName = parentFieldName + '.amount';
  const fiatAmountFieldName = parentFieldName + '.fiatAmount';

  const sendAll = (evt) => {
    evt.preventDefault();
    form.change(amountFieldName, fullAmount);
  };

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
    <Wrapper>
      <AmountFieldWrapper>
        <FormField
          connectLabel
          label={
            <span style={{ whiteSpace: 'nowrap' }}>
              <span className="v-align">
                {source
                  ? __('%{currency} amount', {
                      currency: source.token
                        ? TokenName.from({ token: source.token })
                        : TokenName.from({ account: source.account }),
                    })
                  : __('Amount')}
              </span>
              {!!fullAmount && (
                <SendAllLink as="a" onClick={sendAll}>
                  {__('All')}
                </SendAllLink>
              )}
            </span>
          }
        >
          {/* <Tooltip.Trigger
            tooltip={<FiatValue fieldName={amountFieldName} source={source} />}
          > */}
          <Form.TextField
            name={amountFieldName}
            skin="filled-inverted"
            config={{
              format: (value) => {
                if (value && typeof value === 'string') {
                  return value.replace(',', '.');
                }
                return value;
              },
            }}
            placeholder="0.00000"
            validate={positiveNumber}
          />
          {/* </Tooltip.Trigger> */}
        </FormField>
      </AmountFieldWrapper>

      {!!fiatCurrency && !!price && source?.account?.token === '0' && (
        <>
          <EqualSign>≈</EqualSign>

          <FiatAmountFieldWrapper>
            <FormField
              connectLabel
              label={
                <span style={{ whiteSpace: 'nowrap' }}>
                  <span className="v-align">
                    {__('%{currency} amount', { currency: fiatCurrency })}
                  </span>
                </span>
              }
            >
              <Form.TextField
                name={fiatAmountFieldName}
                skin="filled-inverted"
                placeholder="0.00"
              />
            </FormField>
          </FiatAmountFieldWrapper>
        </>
      )}
    </Wrapper>
  );
}
