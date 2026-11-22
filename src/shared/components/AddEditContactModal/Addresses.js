import { modernIconButton } from 'utils/buttonStyles';
// External
import { useRef, useEffect } from 'react';
import { useField } from 'react-final-form';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade, mix } from 'utils/color';
import { ContactInput } from './Fields';

// Internal
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Form from 'components/Form';
import FormField from 'components/FormField';
import { useFieldValue } from 'lib/form';
import { callAPI } from 'lib/api';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

__ = __context('AddEditContact');

const RemoveButton = styled.button(({ theme }) => ({
  background: 'transparent', border: 0, padding: 0,
  position: 'absolute',
  left: 3,
  bottom: 8,
  cursor: 'pointer',
  width: '1.2em',
  height: '1.2em',
  fontSize: '.8em',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.mixer(0.75),
  opacity: 1,
  transition: `color ${timing.normal}, opacity ${timing.normal}`,
  '&:hover': {
    color: theme.mixer(0.875),
  },
  ...(theme.modern && {
    position: 'static',
    alignSelf: 'end', color: mix(theme.danger, theme.foreground, 0.45),
    borderRadius: 10, background: fade(theme.danger, 0.92),
    '&:hover': { background: fade(theme.danger, 0.8), color: theme.foreground },
    ...modernIconButton(theme, true),
  }),
}));

const NXSAddress = styled.div({
  display: 'flex',
  alignItems: 'center',
  margin: '0 -30px',
  padding: '0 30px',
  position: 'relative',
}, ({ theme }) => theme.modern && ({
  display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(120px, .4fr) 36px',
  alignItems: 'start', gap: 12, margin: '0 0 12px', padding: '0 0 14px',
  borderBottom: `1px solid ${fade(theme.foreground, 0.92)}`,
  '> button': { gridColumn: 3, gridRow: 1 },
  '> div': { minWidth: 0, margin: 0 },
  '> div:nth-of-type(1)': { gridColumn: 1, gridRow: 1 },
  '> div:nth-of-type(2)': { gridColumn: 2, gridRow: 1 },
  '@media (max-width: 560px)': {
    gridTemplateColumns: 'minmax(0, 1fr) 36px',
    '> button': { gridColumn: 2 },
    '> div:nth-of-type(2)': { gridColumn: 1, gridRow: 2 },
  },
}));

const AddressWrapper = styled.div({
  flexGrow: 5,
  flexBasis: 0,
  marginRight: '1em',
});

const LabelWrapper = styled.div({
  flexGrow: 2,
  flexBasis: 0,
});

const AddButton = styled(Button)(({ theme }) => theme.modern && ({
  height: 36, padding: '8px 12px', borderRadius: 9, fontSize: 12,
  border: `1px dashed ${fade(theme.primary, 0.55)}`,
  color: theme.primary, background: fade(theme.primary, 0.96),
  '&:hover': { background: fade(theme.primary, 0.88) },
}));

const PlusIcon = styled(Icon)({
  fontSize: '.8em',
});

export default function Addresses({ fields, isMine }) {
  const theme = useTheme();
  const lastInputRef = useRef();
  const justAddedRef = useRef(false);
  const contactName = useFieldValue('name');

  useEffect(() => {
    // Focus the address input after it has just been added
    if (justAddedRef.current) {
      justAddedRef.current = false;
      lastInputRef.current?.focus();
    }
  });

  const validateAddress = async (value) => {
    value = value?.trim();
    if (!value) return;
    // Allow if it's genesis (User ID)
    // TODO: improve this
    if (value.startsWith('a') && value.length === 64) return;

    try {
      const { valid, mine } = await callAPI('system/validate/address', {
        address: value,
      });
      if (!valid) {
        return __('Invalid address');
      }
      if (isMine && !mine) {
        return __('This is not one of your addresses.');
      } else if (!isMine && mine) {
        return __('This is one of your addresses.');
      }
    } catch (err) {
      console.error(err);
      return __('Invalid address');
    }
  };

  const addNewAddress = () => {
    fields.push({ address: '', label: '' });
    justAddedRef.current = true;
  };

  const addressLabel = isMine
    ? contactName
      ? __('My Nexus address for %{name}', { name: contactName })
      : __('My Nexus address')
    : contactName
    ? __("%{name}'s Nexus address", { name: contactName })
    : __('Their Nexus address');

  return (
    <div className="mt2">
      {theme.modern && <div style={{ marginBottom: 12, fontSize: 12 }}>{isMine ? __('My addresses for this contact') : __('Contact addresses')}</div>}
      {fields.map((fieldName, i) => (
        <NXSAddress key={i}>
          <Tooltip.Trigger tooltip={__('Remove address')}>
            <RemoveButton
              type="button"
              aria-label={__('Remove address')}
              onClick={() => {
                fields.remove(i);
              }}
            >
              ✕
            </RemoveButton>
          </Tooltip.Trigger>

          <AddressWrapper>
            <FormField connectLabel label={__('Address (optional)')} style={{ marginTop: 0 }}>
            <ContactInput
              skin={theme.modern ? 'filled-inverted' : 'underline'}
              name={`${fieldName}.address`}
              placeholder={addressLabel}
              ref={i === fields.length - 1 ? lastInputRef : undefined}
              validate={validateAddress}
            />
            </FormField>
          </AddressWrapper>

          <LabelWrapper>
            <FormField connectLabel label={__('Label (optional)')} style={{ marginTop: 0 }}>
            <ContactInput
              skin={theme.modern ? 'filled-inverted' : 'underline'}
              name={`${fieldName}.label`}
              placeholder={__('Label (optional)')}
            />
            </FormField>
          </LabelWrapper>
        </NXSAddress>
      ))}

      <div className="mt1">
        <AddButton skin={theme.modern ? 'plain' : 'hyperlink'} onClick={addNewAddress}>
          <PlusIcon icon={plusIcon} className="mr0_4" />
          <span className="v-align">{theme.modern ? __('Add address') : addressLabel}</span>
        </AddButton>
      </div>
    </div>
  );
}
