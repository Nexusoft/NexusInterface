// External
import { useSelector } from 'react-redux';
import { useForm } from 'react-final-form';
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import Tooltip from 'components/Tooltip';
import FormField from 'components/FormField';
import Link from 'components/Link';
import TokenName from 'components/TokenName';
import { numericOnly, useFieldValue } from 'lib/form';
import { selectSource } from 'lib/send';

__ = __context('Send');

const floatRegex = /^[0-9]+(.[0-9]*)?$/;

const SendAmount = styled.div({
  display: 'flex',
});

const SendAmountField = styled.div({
  flex: 1,
});

const SendAllLink = styled(Link)({
  textTransform: 'uppercase',
  marginLeft: '1em',
  fontSize: '.9em',
  verticalAlign: 'middle',
});

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

function FiatValue({ fieldName, source }) {
  const value = useFieldValue(fieldName);
  const price = useSelector((state) => state.market?.price);
  const currency = useSelector((state) => state.market?.currency);
  const isInNXS = (source?.account?.token || source?.token?.address) === '0';
  const fiat = isInNXS && nxsToFiat(value, price);

  return fiat ? `≈ ${fiat} ${currency}` : null;
}

export default function AmountField({ parentFieldName }) {
  const source = selectSource();
  const form = useForm();
  const fullAmount = (source?.account || source?.token)?.balance;
  const fieldName = parentFieldName + '.amount';

  const sendAll = (evt) => {
    evt.preventDefault();
    form.change(fieldName, fullAmount);
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
                  {__('All')}
                </SendAllLink>
              )}
            </span>
          }
        >
          <Tooltip.Trigger
            tooltip={<FiatValue fieldName={fieldName} source={source} />}
          >
            <Form.TextField
              name={fieldName}
              skin="filled-inverted"
              config={{
                format: (value, name) => {
                  return value ? value.replace(',', '.') : '';
                },
              }}
              placeholder="0.00000"
              validate={positiveNumber}
            />
          </Tooltip.Trigger>
        </FormField>
      </SendAmountField>
    </SendAmount>
  );
}
