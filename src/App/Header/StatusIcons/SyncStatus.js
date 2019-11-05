// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import checkIcon from 'icons/check.svg';
import syncingIcon from 'icons/syncing.svg';

import StatusIcon from './StatusIcon';

const SpinningIcon = styled(StatusIcon)({
  animation: `${animations.spin} 2s linear infinite`,
});

/**
 * Handles the Sync Status
 *
 * @class SyncStatus
 * @extends {React.Component}
 */
@connect(({ core: { info: { synccomplete } } }) => {
  const syncUnknown =
    (!synccomplete && synccomplete !== 0) ||
    synccomplete < 0 ||
    synccomplete > 100;
  return {
    syncUnknown,
    synchronizing: synccomplete !== 100,
    percentSynced: !syncUnknown ? synccomplete : 0,
  };
})
class SyncStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof SyncStatus
   */
  render() {
    const { syncUnknown, synchronizing, percentSynced } = this.props;
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
}
export default SyncStatus;
