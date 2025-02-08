// External
import { useRef, MutableRefObject, HTMLAttributes, ReactNode } from 'react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import { TextField } from 'components/TextField';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { showNotification } from 'lib/ui';
import copyIcon from 'icons/copy.svg';

const RawAddressComponent = styled.div({
  // marginTop: '1em',
});

const AddressTextField = styled(TextField)<{
  hasLabel?: boolean;
}>(
  ({ hasLabel }) =>
    hasLabel && {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    }
);

const Label = styled.div(({ theme }) => ({
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  background: theme.mixer(0.125),
  fontSize: '.9em',
  padding: '.1em .4em',
}));

const CopyButton = styled(Button)(({ theme }) => ({
  borderLeft: `1px solid ${theme.mixer(0.125)}`,
}));

function copyAddress(
  address: string,
  inputRef: MutableRefObject<HTMLInputElement | null>
) {
  clipboard.writeText(address);
  inputRef.current?.select();
  showNotification(__('Address has been copied to clipboard'), 'success');
}

export interface RawAddressProps extends HTMLAttributes<HTMLDivElement> {
  address: string;
  label?: ReactNode;
  copyable?: boolean;
}

/**
 * Nexus Address with Copy functionality
 */
export default function RawAddress({
  address,
  label,
  copyable = true,
  ...rest
}: RawAddressProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <RawAddressComponent {...rest}>
      {!!label && <Label>{label}</Label>}
      <AddressTextField
        readOnly
        skin="filled-inverted"
        value={address}
        ref={inputRef}
        right={
          !!copyable && (
            <Tooltip.Trigger tooltip={__('Copy to clipboard')}>
              <CopyButton
                skin="filled-inverted"
                fitHeight
                grouped="right"
                onClick={() => copyAddress(address, inputRef)}
              >
                <Icon icon={copyIcon} className="mr0_4" />
              </CopyButton>
            </Tooltip.Trigger>
          )
        }
        hasLabel={!!label}
      />
    </RawAddressComponent>
  );
}
