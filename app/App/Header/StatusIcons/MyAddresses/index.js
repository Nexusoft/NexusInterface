// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import userIcon from 'images/user.sprite.svg';
import UIController from 'components/UIController';
import StatusIcon from 'components/StatusIcon';
import { timing } from 'styles';
import { color } from 'utils';
import MyAddressesModal from './MyAddressesModal';

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

const MyAddresses = () => (
  <Tooltip.Trigger
    align="end"
    tooltip="My Addresses"
    style={{ transform: 'translateX(12px)' }}
  >
    <MyAddressesIcon
      icon={userIcon}
      onClick={() => {
        UIController.openModal(MyAddressesModal);
      }}
    />
  </Tooltip.Trigger>
);

export default MyAddresses;
