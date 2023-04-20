// External Dependencies
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { formatNumber } from 'lib/intl';
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
  return synchronized ? (
    <Tooltip.Trigger tooltip={__('Synchronized')}>
      <StatusIcon>
        <Icon icon={checkIcon} />
      </StatusIcon>
    </Tooltip.Trigger>
  ) : (
    <Tooltip.Trigger tooltip={<SyncTooltip />}>
      <StatusIcon>
        <SpinningIcon icon={syncingIcon} />
      </StatusIcon>
    </Tooltip.Trigger>
  );
}

function SyncTooltip() {
  const sync = useSelector((state) => state.core.systemInfo?.sync);
  if (!sync) return null;

  const {
    currentBlock,
    networkBlock,
    percentSynchronized,
    secondsRemaining,
    syncProgress,
  } = sync;

  return (
    <div className="text-center">
      <div>
        {__('Synchronizing')} {syncProgress}%...
      </div>
      <div>
        {__('Blocks')}: {formatNumber(currentBlock, 0)} /{' '}
        {formatNumber(networkBlock, 0)} ({percentSynchronized}%)
      </div>
      <div>
        {__('Estimated %{time} remaining', {
          time: timeRemaining(secondsRemaining),
        })}
      </div>
    </div>
  );
}

function timeRemaining(secondsRemaining) {
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
