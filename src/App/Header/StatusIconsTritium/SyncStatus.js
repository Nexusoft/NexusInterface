// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { isSynchronized } from 'selectors';
import checkIcon from 'images/check.sprite.svg';
import syncingIcon from 'images/syncing.sprite.svg';

import StatusIcon from './StatusIcon';

const SpinningIcon = styled(Icon)({
  animation: `${animations.spin} 2s linear infinite`,
});

/**
 * Handles the Sync Status
 *
 * @class SyncStatus
 * @extends {React.Component}
 */
@connect(state => {
  const {
    core: {
      systemInfo: { synccomplete },
    },
  } = state;
  return {
    synchronized: isSynchronized(state),
    synccomplete,
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
    const { synchronized, synccomplete } = this.props;
    return synchronized ? (
      <Tooltip.Trigger tooltip={__('Synchronized')}>
        <StatusIcon>
          <Icon icon={checkIcon} />
        </StatusIcon>
      </Tooltip.Trigger>
    ) : (
      <Tooltip.Trigger tooltip={`${__('Synchronizing')}: ${synccomplete}%`}>
        <StatusIcon>
          <SpinningIcon icon={syncingIcon} />
        </StatusIcon>
      </Tooltip.Trigger>
    );
  }
}
export default SyncStatus;
