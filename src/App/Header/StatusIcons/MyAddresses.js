// External
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import userIcon from 'icons/user.svg';
import { openModal } from 'lib/ui';
import MyAddressesModal from 'components/MyAddressesModal';
import { timing } from 'styles';
import * as color from 'utils/color';
import StatusIcon from './StatusIcon';

__ = __context('Header');

const MyAddressesIcon = styled(StatusIcon)(({ theme }) => ({
  cursor: 'pointer',
  color: theme.primary,
  transitionProperty: 'color, filter',
  transitionDuration: timing.normal,

  '&:hover': {
    color: color.lighten(theme.primary, 0.2),
    filter: `drop-shadow(0 0 3px ${color.fade(theme.primary, 0.5)})`,
  },
}));

export default function MyAddresses() {
  return (
    <Tooltip.Trigger
      align="end"
      tooltip={__('My Addresses')}
      style={{ transform: 'translateX(12px)' }}
    >
      <MyAddressesIcon
        icon={userIcon}
        onClick={() => {
          openModal(MyAddressesModal);
        }}
      />
    </Tooltip.Trigger>
  );
}
