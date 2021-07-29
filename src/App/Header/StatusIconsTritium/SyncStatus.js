// External Dependencies
import { Component } from 'react';
import { connect } from 'react-redux';
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

/**
 * Handles the Sync Status
 *
 * @class SyncStatus
 * @extends {React.Component}
 */
@connect((state) => {
  const {
    core: { systemInfo },
  } = state;
  return {
    synchronized: isSynchronized(state),
    syncprogress: systemInfo?.syncprogress,
  };
})
class SyncStatus extends Component {
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
      <Tooltip.Trigger tooltip={`${__('Synchronizing')}: ${syncprogress}%`}>
        <StatusIcon>
          <SpinningIcon icon={syncingIcon} />
        </StatusIcon>
      </Tooltip.Trigger>
    );
  }
}
export default SyncStatus;
