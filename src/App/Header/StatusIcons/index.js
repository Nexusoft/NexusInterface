import React from 'react';
import styled from '@emotion/styled';

import { consts, timing, animations } from 'styles';

import LogInStatus from './LogInStatus';
import StakingStatus from './StakingStatus';
import SyncStatus from './SyncStatus';
import MyAddresses from './MyAddresses';

const StatusIconsComponent = styled.div({
  position: 'absolute',
  top: 24,
  right: 40,
  animation: `${animations.fadeIn} ${timing.slow} ${consts.enhancedEaseOut}`,
  display: 'flex',
  alignItems: 'center',
  fontSize: 20,
});

const StatusIcons = () => (
  <StatusIconsComponent>
    <SyncStatus />
    <LogInStatus />
    <StakingStatus />
    <MyAddresses />
  </StatusIconsComponent>
);

export default StatusIcons;
