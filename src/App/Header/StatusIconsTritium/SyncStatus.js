// External Dependencies
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { isSynchronized } from 'selectors';
import checkIcon from 'icons/check.svg';
import syncingIcon from 'icons/syncing.svg';

import StatusIcon from './StatusIcon';

__ = __context('Header');

const SpinningIcon = styled(Icon)({
  animation: `${animations.spin} 2s linear infinite`,
});

export default function SyncStatus() {
  const synchronized = useSelector(isSynchronized);
  const syncProgress = useSelector(
    (state) => state.core.systemInfo?.syncprogress
  );
  return synchronized ? (
    <Tooltip.Trigger tooltip={__('Synchronized')}>
      <StatusIcon>
        <Icon icon={checkIcon} />
      </StatusIcon>
    </Tooltip.Trigger>
  ) : (
    <Tooltip.Trigger tooltip={`${__('Synchronizing')}: ${syncProgress}%`}>
      <StatusIcon>
        <SpinningIcon icon={syncingIcon} />
      </StatusIcon>
    </Tooltip.Trigger>
  );
}
