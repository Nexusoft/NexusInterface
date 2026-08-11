import styled from '@emotion/styled';

import { consts, timing, animations } from 'styles';

import StakingStatus from './StakingStatus';
import SyncStatus from './SyncStatus';
import UserControl from './UserControl';

const StatusIconsComponent = styled.div({
  position: 'absolute',
  top: 24,
  right: 40,
  animation: `${animations.fadeIn} ${timing.slow} ${consts.enhancedEaseOut}`,
  display: 'flex',
  alignItems: 'center',
  fontSize: 20,
});

export default function StatusIcons() {
  return (
    <StatusIconsComponent>
      <SyncStatus />
      <StakingStatus />
      <UserControl />
    </StatusIconsComponent>
  );
}
