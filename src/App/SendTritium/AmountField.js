// External
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Tooltip from 'components/Tooltip';
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

function AmountTextField({ input, source, ...rest }) {
  const price = useSelector((state) => state.market?.price);
  const currency = useSelector((state) => state.market?.currency);
  const isInNXS = (source?.account?.token || source?.token?.address) === '0';
  const fiat = isInNXS && nxsToFiat(input.value, price);

  return (
    <Tooltip.Trigger tooltip={fiat ? `≈ ${fiat} ${currency}` : null}>
      <TextField.RF input={input} {...rest} />
    </Tooltip.Trigger>
  );
}

export default function AmountField({ source, parentFieldName, change }) {
  const fullAmount = (source?.account || source?.token)?.balance;

  const amountFieldName = () =>
    (parentFieldName ? parentFieldName + '.' : '') + 'amount';

  const sendAll = (evt) => {
    evt.preventDefault();
    change(amountFieldName(), fullAmount);
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
          <Field
            component={AmountTextField}
            skin="filled-inverted"
            name={amountFieldName()}
            placeholder="0.00000"
            source={source}
          />
        </FormField>
      </SendAmountField>
    </SendAmount>
  );
}
