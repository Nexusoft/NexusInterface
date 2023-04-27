// External Dependencies
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import checkIcon from 'icons/check.svg';
import syncingIcon from 'icons/syncing.svg';

import StatusIcon from './StatusIcon';

__ = __context('Header');

const SpinningIcon = styled(StatusIcon)({
  animation: `${animations.spin} 2s linear infinite`,
});

export default function SyncStatus() {
  const syncUnknown = useSelector(
    ({
      core: {
        info: { synccomplete },
      },
    }) =>
      (!synccomplete && synccomplete !== 0) ||
      synccomplete < 0 ||
      synccomplete > 100
  );
  const synchronizing = useSelector(
    (state) => state.core.info.synccomplete !== 100
  );
  const percentSynced = useSelector((state) =>
    !syncUnknown ? state.core.info.synccomplete : 0
  );

  return syncUnknown ? (
    <Tooltip.Trigger tooltip={__('Checking sync status')}>
      <SpinningIcon className="dim" icon={syncingIcon} />
    </Tooltip.Trigger>
  ) : synchronizing ? (
    <Tooltip.Trigger tooltip={`${__('Synchronizing')}: ${percentSynced}%`}>
      <SpinningIcon icon={syncingIcon} />
    </Tooltip.Trigger>
  ) : (
    <Tooltip.Trigger tooltip={__('Synchronized')}>
      <StatusIcon icon={checkIcon} />
    </Tooltip.Trigger>
  );
}
