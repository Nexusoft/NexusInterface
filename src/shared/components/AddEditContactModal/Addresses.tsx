// External
import { useRef, useEffect } from 'react';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Form from 'components/Form';
import { required, checkAll, useFieldValue } from 'lib/form';
import { callAPI } from 'lib/api';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

__ = __context('AddEditContact');

const RemoveButton = styled.div(({ theme }) => ({
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
}));

const NXSAddress = styled.div({
  display: 'flex',
  alignItems: 'center',
  margin: '0 -30px',
  padding: '0 30px',
  position: 'relative',
});

const AddressWrapper = styled.div({
  flexGrow: 5,
  flexBasis: 0,
  marginRight: '1em',
});

const LabelWrapper = styled.div({
  flexGrow: 2,
  flexBasis: 0,
});

const AddButton = styled(Button)({
  // fontSize: '.9em',
  // '&, &:active, &&:disabled': {
  //   color: theme.mixer(0.5),
  // },
  // '&:hover': {
  //   color: theme.mixer(0.75),
  // },
});

const PlusIcon = styled(Icon)({
  fontSize: '.8em',
});

export default function Addresses({
  fields,
  isMine,
}: {
  fields: any; // some weird type from react-final-form-arrays
  isMine?: boolean;
}) {
  const lastInputRef = useRef<HTMLInputElement>(null);
  const justAddedRef = useRef(false);
  const contactName = useFieldValue('name');

  useEffect(() => {
    // Focus the address input after it has just been added
    if (justAddedRef.current) {
      justAddedRef.current = false;
      lastInputRef.current?.focus();
    }
  });

  const validateAddress = async (value: string) => {
    // Allow if it's genesis (User ID)
    // TODO: improve this
    if (value.startsWith('a') && value.length === 64) return undefined;

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
    return undefined;
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
      {fields.map((fieldName: string, i: number) => (
        <NXSAddress key={i}>
          <Tooltip.Trigger tooltip={__('Remove address')}>
            <RemoveButton
              onClick={() => {
                fields.remove(i);
              }}
            >
              ✕
            </RemoveButton>
          </Tooltip.Trigger>

          <AddressWrapper>
            <Form.TextField
              name={`${fieldName}.address`}
              placeholder={addressLabel}
              ref={i === fields.length - 1 ? lastInputRef : undefined}
              validate={checkAll(required(), validateAddress)}
            />
          </AddressWrapper>

          <LabelWrapper>
            <Form.TextField
              name={`${fieldName}.label`}
              placeholder={__('Label (optional)')}
            />
          </LabelWrapper>
        </NXSAddress>
      ))}

      <div className="mt1">
        <AddButton skin="hyperlink" onClick={addNewAddress}>
          <PlusIcon icon={plusIcon} className="mr0_4" />
          <span className="v-align">{addressLabel}</span>
        </AddButton>
      </div>
    </div>
  );
}
