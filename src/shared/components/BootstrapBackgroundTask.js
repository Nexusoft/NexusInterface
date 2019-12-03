// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import { openModal } from 'lib/ui';
import BackgroundTask from 'components/BackgroundTask';
import Icon from 'components/Icon';
import { bootstrapEvents } from 'lib/bootstrap';
import { animations, timing } from 'styles';
import workIcon from 'icons/work.svg';
import BootstrapModal from 'components/BootstrapModal';

__ = __context('Bootstrap');

const BootstrapBackgroundTaskComponent = styled(BackgroundTask)(
  {
    animation: `${animations.fadeIn} ${timing.normal} ease-out`,
  },
  ({ closing }) =>
    closing && {
      animation: `${animations.fadeOut} ${timing.normal} ease-in`,
    }
);

function getPercentage({ step, details }) {
  switch (step) {
    case 'backing_up':
      return 0;
    case 'downloading':
      const { downloaded, totalSize } = details || {};
      return totalSize
        ? Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10
        : 0;
    case 'extracting':
    case 'stopping_core':
    case 'moving_db':
    case 'restarting_core':
    case 'rescanning':
      return 100;
    default:
      return 0;
  }
}

function getStatusMsg({ step, details }) {
  switch (step) {
    case 'backing_up':
      return __('Backing up...');
    case 'downloading':
      const percentage = getPercentage({ step, details });
      return `${__('Downloading')}... ${percentage}%`;
    case 'extracting':
      return __('Decompressing...');
    case 'stopping_core':
      return __('Stopping Core...');
    case 'moving_db':
      return __('Moving...');
    case 'restarting_core':
      return __('Restarting Core...');
    case 'rescanning':
      return __('Rescanning Wallet...');
    default:
      return '';
  }
}

/**
 * Background Tasks for the Bootstrap
 *
 * @export
 * @class BootstrapBackgroundTask
 * @extends {Component}
 */
@connect(state => ({
  statusMsg: getStatusMsg(state.bootstrap),
}))
export default class BootstrapBackgroundTask extends Component {
  componentDidMount() {
    bootstrapEvents.on('abort', this.closeTask);
    bootstrapEvents.on('error', this.closeTask);
    bootstrapEvents.on('success', this.closeTask);
  }

  componentWillUnmount() {
    bootstrapEvents.off('abort', this.closeTask);
    bootstrapEvents.off('error', this.closeTask);
    bootstrapEvents.off('success', this.closeTask);
  }

  /**
   * Handle Minimize
   *
   * @memberof BootstrapBackgroundTask
   */
  maximize = () => {
    openModal(BootstrapModal, {
      bootstrapper: this.props.bootstrapper,
      maximizedFromBackground: true,
    });
    this.closeTask();
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof BootstrapBackgroundTask
   */
  render() {
    return (
      <BootstrapBackgroundTaskComponent
        assignClose={closeTask => (this.closeTask = closeTask)}
        onClick={this.maximize}
        index={this.props.index}
      >
        <Icon icon={workIcon} className="space-right" />
        {this.props.statusMsg}
      </BootstrapBackgroundTaskComponent>
    );
  }
}
