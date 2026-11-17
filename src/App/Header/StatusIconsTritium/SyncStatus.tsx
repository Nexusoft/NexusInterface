// External Dependencies
import styled from '@emotion/styled';

// Internal Global Dependencies
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { formatNumber } from 'lib/intl';
import { useCoreInfo, useSyncState } from 'lib/coreInfo';
import checkIcon from 'icons/check.svg';
import syncingIcon from 'icons/syncing.svg';

import StatusIcon from './StatusIcon';

__ = __context('Header');

const SpinningIcon = styled(Icon)({
  animation: `${animations.spin} 2s linear infinite`,
});

export default function SyncStatus() {
  const syncState = useSyncState();
  return syncState === 'synchronized' ? (
    <Tooltip.Trigger tooltip={__('Synchronized')}>
      <StatusIcon>
        <Icon icon={checkIcon} />
      </StatusIcon>
    </Tooltip.Trigger>
  ) : (
    <Tooltip.Trigger
      tooltip={
        syncState === 'unknown' ? (
          __('Synchronization status unknown')
        ) : (
          <SyncTooltip />
        )
      }
    >
      <StatusIcon>
        {syncState === 'unknown' ? (
          <Icon icon={syncingIcon} />
        ) : (
          <SpinningIcon icon={syncingIcon} />
        )}
      </StatusIcon>
    </Tooltip.Trigger>
  );
}

function SyncTooltip() {
  const coreInfo = useCoreInfo();
  const { syncing, blocks } = coreInfo || {};
  if (!syncing || typeof syncing !== 'object') {
    return <>{__('Synchronizing')}</>;
  }

  const { networkBlock, completed, secondsRemaining, progress } = syncing;

  return (
    <div className="text-center">
      <div>
        {__('Synchronizing')} {progress}%...
      </div>
      <div>
        {__('Blocks')}:{' '}
        {typeof blocks === 'number' ? formatNumber(blocks, 0) : ''} /{' '}
        {formatNumber(networkBlock, 0)} ({completed}%)
      </div>
      <div>
        {__('Estimated %{time} remaining', {
          time: timeRemaining(secondsRemaining),
        })}
      </div>
    </div>
  );
}

function timeRemaining(secondsRemaining: number) {
  const hours = Math.floor(secondsRemaining / (60 * 60));
  const hText =
    hours > 0 ? __('%{smart_count} hour |||| %{smart_count} hours', hours) : '';
  if (hours > 9) {
    return hText;
  }

  const minutes = Math.floor((secondsRemaining - hours * 60 * 60) / 60);
  const mText =
    minutes > 0
      ? __('%{smart_count} minute |||| %{smart_count} minutes', minutes)
      : '';
  if (hours > 0) {
    return hText + ' ' + mText;
  } else if (minutes > 10) {
    return mText;
  }

  const seconds = secondsRemaining - hours * 60 * 60 - minutes * 60;
  const sText = __(
    '%{smart_count} second |||| %{smart_count} seconds',
    seconds
  );
  if (minutes > 0) {
    return mText + ' ' + sText;
  } else {
    return sText;
  }
}
