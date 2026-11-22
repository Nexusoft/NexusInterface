// External
import { useRef } from 'react';
import { useTheme } from '@emotion/react';
import { clipboard } from 'electron';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { showNotification } from 'lib/ui';
import copyIcon from 'icons/copy.svg';

const RawAddressComponent = styled.div({
  minWidth: 0,
  maxWidth: '100%',
});

const AddressTextField = styled(TextField)(
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
  ...(theme.modern ? { flexShrink: 0 } : { borderLeft: `1px solid ${theme.mixer(0.125)}` }),
}));

function copyAddress(address, inputRef) {
  clipboard.writeText(address);
  inputRef.current?.select();
  showNotification(__('Address has been copied to clipboard'), 'success');
}

/**
 * Nexus Address with Copy functionality
 *
 * @export
 * @class RawAddress
 * @extends {React.Component}
 */
export default function RawAddress({
  address,
  label,
  copyable = true,
  ...rest
}) {
  const { modern } = useTheme();
  const inputRef = useRef();

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
                skin={modern ? 'plain' : 'filled-inverted'}
                square={modern ? 32 : undefined}
                fitHeight={!modern}
                grouped={modern ? undefined : 'right'}
                aria-label={__('Copy to clipboard')}
                onClick={() => copyAddress(address, inputRef)}
              >
                <Icon icon={copyIcon} />
              </CopyButton>
            </Tooltip.Trigger>
          )
        }
        hasLabel={!!label}
      />
    </RawAddressComponent>
  );
}
