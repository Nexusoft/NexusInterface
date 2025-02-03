// External
import { HTMLAttributes, ReactNode, useRef } from 'react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import { showNotification } from 'lib/ui';
import { consts, timing } from 'styles';

const SegmentedAddressComponent = styled.div({
  // marginTop: '1em',
});

const Address = styled.div<{
  copyable?: boolean;
  hasLabel?: boolean;
}>(
  ({ theme }) => ({
    width: '100%',
    background: theme.background,
    color: theme.foreground,
    border: `1px solid ${theme.mixer(0.125)}`,
    borderRadius: 2,
    fontFamily: consts.monoFontFamily,
    lineHeight: 1.3,
    padding: '.3em 1em',
    textAlign: 'center',
    whiteSpace: 'pre',
    cursor: 'pointer',
    userSelect: 'none',
    transition: `background ${timing.normal}`,
  }),
  ({ copyable, theme }) =>
    !!copyable && {
      '&:hover': {
        background: theme.mixer(0.05),
      },
    },
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
  padding: '.1em .8em',
}));

function copyAddress(address: string) {
  clipboard.writeText(address);
  showNotification(__('Address has been copied to clipboard'), 'success');
}

function renderAddress(address: string) {
  const line1 = [
    address.substring(0, 6),
    address.substring(6, 11),
    address.substring(11, 16),
    address.substring(16, 21),
    address.substring(21, 26),
  ];
  const line2 = [
    ' ' + address.substring(26, 31),
    address.substring(31, 36),
    address.substring(36, 41),
    address.substring(41, 46),
    address.substring(46, 51),
  ];
  return `${line1.join(' ')}\n${line2.join(' ')}`;
}

export interface SegmentedAddressProps extends HTMLAttributes<HTMLDivElement> {
  address: string;
  label?: ReactNode;
  copyable?: boolean;
}

/**
 * Nexus Address with Copy functionality
 */
export default function SegmentedAddress({
  address,
  label,
  copyable = true,
  ...rest
}: SegmentedAddressProps) {
  const addressRef = useRef<HTMLDivElement>(null);
  return (
    <SegmentedAddressComponent {...rest}>
      {!!label && <Label>{label}</Label>}

      <Tooltip.Trigger
        tooltip={copyable ? __('Click to copy to clipboard') : undefined}
      >
        <Address
          ref={addressRef}
          hasLabel={!!label}
          copyable={copyable}
          onClick={copyable ? () => copyAddress(address) : undefined}
        >
          {renderAddress(address)}
        </Address>
      </Tooltip.Trigger>
    </SegmentedAddressComponent>
  );
}
