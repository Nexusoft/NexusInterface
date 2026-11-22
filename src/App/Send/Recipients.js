import { modernIconButton } from 'utils/buttonStyles';
// External
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';

// Internal
import Tooltip from 'components/Tooltip';
import { timing } from 'styles';
import RecipientNameOrAddress from './RecipientNameOrAddress';
import AmountField from './AmountField';
import ReferenceField from './ReferenceField';

__ = __context('Send');

const RemoveButton = styled.button(({ theme }) => ({
  border: 0,
  padding: 0,
  background: 'transparent',
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
  ...(theme.modern && { ...modernIconButton(theme, true), left: 'auto', right: 12, top: 10 }),
}));

const Recipient = styled.div(({ theme }) => ({
  marginLeft: -30,
  marginRight: -30,
  padding: '0 30px',
  position: 'relative',
  ...(theme.modern && {
    marginLeft: 0, marginRight: 0, padding: '20px 20px 24px', borderRadius: 14,
    border: `1px solid ${fade(theme.primary, 0.85)}`, background: fade(theme.primary, 0.97),
    '.recipient-heading': { fontSize: 12, fontWeight: 500, color: theme.primary, paddingRight: 32, marginBottom: 4 },
    '@media (max-width: 600px)': { padding: '20px 12px 16px' },
  }),
}));

const BaseFields = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  ...(theme.modern && {
    gap: 20, minWidth: 0,
    '@media (max-width: 1000px)': { flexDirection: 'column', gap: 0, '> div': { flex: '0 1 auto', marginRight: 0, minWidth: 0 } },
  }),
}));

const LeftHalf = styled.div(({ theme }) => ({
  flex: '5 5 500px',
  marginRight: '1em',
  ...(theme.modern && { minWidth: 0, marginRight: 0 }),
}));

const RightHalf = styled.div(({ theme }) => ({
  flex: '2 2 120px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  ...(theme.modern && { minWidth: 0, flex: '3 3 240px' }),
}));

export default function Recipients({ fields }) {
  const { modern } = useTheme();
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
        <Recipient key={i} style={{ marginTop: modern ? 20 : i > 0 ? '-1em' : '0.5em' }}>
          {modern && <div className="recipient-heading">{__('Recipient')} {i + 1}</div>}
          {fields.length !== 1 && (
            <Tooltip.Trigger tooltip={__('Remove recipient')}>
              <RemoveButton
                type="button"
                aria-label={__('Remove recipient')}
                onClick={() => {
                  fields.remove(i);
                }}
              >
                ✕
              </RemoveButton>
            </Tooltip.Trigger>
          )}

          <BaseFields>
            <LeftHalf>
              <RecipientNameOrAddress parentFieldName={fieldName} />
            </LeftHalf>

            <RightHalf>
              <AmountField parentFieldName={fieldName} />
              <ReferenceField parentFieldName={fieldName} />
            </RightHalf>
          </BaseFields>
        </Recipient>
      ))}
    </>
  );
  // }
}
