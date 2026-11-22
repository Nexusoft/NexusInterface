// External
import { useRef, useState, useEffect } from 'react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import { showNotification } from 'lib/ui';
import { timing, consts } from 'styles';

const TruncateMiddleAddressComponent = styled.div({
  minWidth: 0,
  maxWidth: '100%',
});

const AddressWrapper = styled.div(
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
  maxWidth: '32ch',
  minWidth: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  fontFamily: consts.monoFontFamily,
});

const AddressCopy = styled.div(
  {
    flex: '1 1 0',
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
  },
  ({ right, overflown }) =>
    right && {
      justifyContent: 'flex-end',
      display: overflown ? 'flex' : 'none',
    }
);

const AddressContent = styled.div({
  whiteSpace: 'nowrap',
  width: 'max-content',
  flexShrink: 0,
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
  const addressRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    const checkOverflow = () => {
      if (!addressRef.current || !contentRef.current) return;
      setOverflown(contentRef.current.offsetWidth > addressRef.current.clientWidth);
    };

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (addressRef.current) resizeObserver.observe(addressRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    checkOverflow();
    return () => resizeObserver.disconnect();
  }, []);

  return { overflown, addressRef, contentRef };
}

function copyAddress(address) {
  clipboard.writeText(address);
  showNotification(__('Address has been copied to clipboard'), 'success');
}

/**
 * Nexus Address with Copy functionality
 *
 * @export
 * @class TruncateMiddleAddress
 * @extends {React.Component}
 */
export default function TruncateMiddleAddress({
  address,
  label,
  copyable = true,
  ...rest
}) {
  const { overflown, addressRef, contentRef } = useCheckOverflow();

  return (
    <TruncateMiddleAddressComponent {...rest}>
      {!!label && <Label>{label}</Label>}

      <Tooltip.Trigger
        tooltip={copyable ? __('Click to copy to clipboard') : undefined}
      >
        <AddressWrapper
          hasLabel={!!label}
          inputProps={{
            style: { cursor: 'pointer' },
          }}
          copyable={copyable}
          onClick={copyable ? () => copyAddress(address) : undefined}
        >
          <Address ref={addressRef}>
            <AddressCopy left overflown={overflown}>
              <AddressContent ref={contentRef}>{address}</AddressContent>
            </AddressCopy>
            <Ellipsis hidden={!overflown}>...</Ellipsis>
            <AddressCopy right overflown={overflown}>
              <AddressContent>{address}</AddressContent>
            </AddressCopy>
          </Address>
        </AddressWrapper>
      </Tooltip.Trigger>
    </TruncateMiddleAddressComponent>
  );
}
