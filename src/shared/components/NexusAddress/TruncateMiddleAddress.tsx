// External
import { useRef, useState, useEffect, HTMLAttributes, ReactNode } from 'react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import { showNotification } from 'lib/ui';
import { throttled } from 'utils/universal';
import { timing, consts } from 'styles';

const TruncateMiddleAddressComponent = styled.div({
  // marginTop: '1em',
});

const AddressWrapper = styled.div<{
  copyable?: boolean;
  hasLabel?: boolean;
}>(
  ({ theme }) => ({
    width: '100%',
    height: consts.inputHeightEm + 'em',
    background: theme.background,
    color: theme.foreground,
    border: `1px solid ${theme.mixer(0.125)}`,
    borderRadius: 2,
    padding: '0 .8em',
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

const Address = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  fontFamily: consts.monoFontFamily,
});

const AddressCopy = styled.div<{
  left?: boolean;
  right?: boolean;
  overflown?: boolean;
}>(
  {
    flex: '1 1 0',
    overflow: 'hidden',
  },
  ({ left, overflown }) =>
    left && {
      maskImage: overflown
        ? 'linear-gradient(to left, transparent 0%, black 10%, black 100%)'
        : 'none',
    },
  ({ right, overflown }) =>
    right && {
      justifyContent: 'flex-end',
      maskImage:
        'linear-gradient(to right, transparent 0%, black 10%, black 100%)',
      display: overflown ? 'flex' : 'none',
    }
);

const AddressContent = styled.div({
  whiteSpace: 'nowrap',
  width: 'max-content',
});

const Ellipsis = styled.div(
  {
    flexShrink: 0,
    letterSpacing: 1,
    opacity: 0.5,
  },
  ({ hidden }) =>
    hidden && {
      display: 'none',
    }
);

const Label = styled.div(({ theme }) => ({
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  background: theme.mixer(0.125),
  fontSize: '.9em',
  padding: '.1em .4em',
}));

function useCheckOverflow() {
  const [overflown, setOverflown] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = throttled(() => {
      if (!addressRef.current || !contentRef.current) return;
      const containerWidth = addressRef.current.clientWidth;
      const contentWidth = contentRef.current.offsetWidth;
      if (contentWidth > containerWidth && !overflown) {
        setOverflown(true);
      }
      if (contentWidth <= containerWidth && overflown) {
        setOverflown(false);
      }
    }, 500);

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (addressRef.current) {
      resizeObserver.observe(addressRef.current);
    }
    return () => {
      if (addressRef.current) {
        resizeObserver.unobserve(addressRef.current);
      }
    };
  }, []);

  return { overflown, addressRef, contentRef };
}

function copyAddress(address: string) {
  clipboard.writeText(address);
  showNotification(__('Address has been copied to clipboard'), 'success');
}

export interface TruncateMiddleAddressProps
  extends HTMLAttributes<HTMLDivElement> {
  address: string;
  label?: ReactNode;
  copyable?: boolean;
}

/**
 * Nexus Address with Copy functionality
 */
export default function TruncateMiddleAddress({
  address,
  label,
  copyable = true,
  ...rest
}: TruncateMiddleAddressProps) {
  const { overflown, addressRef, contentRef } = useCheckOverflow();

  return (
    <TruncateMiddleAddressComponent {...rest}>
      {!!label && <Label>{label}</Label>}

      <Tooltip.Trigger
        tooltip={copyable ? __('Click to copy to clipboard') : undefined}
      >
        <AddressWrapper
          hasLabel={!!label}
          style={{ cursor: 'pointer' }}
          copyable={copyable}
          onClick={copyable ? () => copyAddress(address) : undefined}
        >
          <Address ref={addressRef}>
            <AddressCopy left overflown={overflown}>
              <AddressContent ref={contentRef}>{address}</AddressContent>
            </AddressCopy>
            <Ellipsis hidden={!overflown}>...</Ellipsis>
            <AddressCopy right overflown={overflown}>
              {address}
            </AddressCopy>
          </Address>
        </AddressWrapper>
      </Tooltip.Trigger>
    </TruncateMiddleAddressComponent>
  );
}
