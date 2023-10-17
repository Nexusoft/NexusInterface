// External
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import { timing } from 'styles';
import RecipientNameOrAddress from './RecipientNameOrAddress';
import AmountField from './AmountField';

__ = __context('Send');

const RemoveButton = styled.div(({ theme }) => ({
  position: 'absolute',
  left: 3,
  top: '1em',
  cursor: 'pointer',
  width: '1.5em',
  height: '1.5em',
  fontSize: '1em',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.mixer(0.75),
  opacity: 1,
  transition: `color ${timing.normal}, opacity ${timing.normal}`,
  '&:hover': {
    color: theme.mixer(0.875),
  },
}));

const Recipient = styled.div({
  marginLeft: -30,
  marginRight: -30,
  padding: '0 30px',
  position: 'relative',
});

const AddressWrapper = styled.div({
  flex: '5 5 500px',
  marginRight: '1em',
});

const BaseFields = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
});

export default function Recipients({ fields }) {
  if (!fields?.length) return null;

  // if (fields.length === 1) {
  //   return (
  //     <>
  //       <Field
  //         name={`${fields.name}[0].address`}
  //         component={RecipientNameOrAddress}
  //         change={change}
  //         sendFrom={sendFrom}
  //       />
  //       <AmountField
  //         fullAmount={accBalance}
  //         parentFieldName={`${fields.name}[0]`}
  //         change={change}
  //         token={token}
  //       />
  //     </>
  //   );
  // } else {
  return (
    <>
      {fields.map((fieldName, i) => (
        <Recipient key={i} style={{ marginTop: i > 0 ? '-1em' : '0.5em' }}>
          {fields.length !== 1 && (
            <Tooltip.Trigger tooltip={__('Remove recipient')}>
              <RemoveButton
                onClick={() => {
                  fields.remove(i);
                }}
              >
                ✕
              </RemoveButton>
            </Tooltip.Trigger>
          )}

          <BaseFields>
            <AddressWrapper>
              <RecipientNameOrAddress parentFieldName={fieldName} />
            </AddressWrapper>

            <AmountField parentFieldName={fieldName} />
          </BaseFields>
        </Recipient>
      ))}
    </>
  );
  // }
}
