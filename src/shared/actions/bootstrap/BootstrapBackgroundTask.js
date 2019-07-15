// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import {
  openErrorDialog,
  openSuccessDialog,
  openModal,
  showNotification,
} from 'actions/globalUI';
import BackgroundTask from 'components/BackgroundTask';
import Icon from 'components/Icon';
import { animations, timing } from 'styles';
import workIcon from 'images/work.sprite.svg';
import BootstrapModal from './BootstrapModal';

const BootstrapBackgroundTaskComponent = styled(BackgroundTask)(
  {
    animation: `${animations.fadeIn} ${timing.normal} ease-out`,
  },
  ({ closing }) =>
    closing && {
      animation: `${animations.fadeOut} ${timing.normal} ease-in`,
    }
);

/**
 * Background Tasks for the Bootstrap
 *
 * @export
 * @class BootstrapBackgroundTask
 * @extends {Component}
 */
@connect(
  null,
  { openErrorDialog, openModal, openSuccessDialog, showNotification }
)
export default class BootstrapBackgroundTask extends Component {
  /**
   *Creates an instance of BootstrapBackgroundTask.
   * @param {*} props
   * @memberof BootstrapBackgroundTask
   */
  constructor(props) {
    super(props);
    props.bootstrapper.registerEvents({
      onProgress: this.handleProgress,
      onAbort: this.handleAbort,
      onError: this.handleError,
      onFinish: this.handleFinish,
    });
  }

  /**
   * Set Status Message
   *
   * @memberof BootstrapBackgroundTask
   */
  statusMessage = ({ step, details }) => {
    switch (step) {
      case 'backing_up':
        return 'Backing up...';
      case 'downloading':
        const { downloaded, totalSize } = details || {};
        const percentage = totalSize
          ? Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10
          : 0;
        return `Downloading... ${percentage}%`;
      case 'extracting':
        return 'Decompressing...';
      case 'stopping_core':
        return 'Stopping daemon...';
      case 'moving_db':
        return 'Moving...';
      case 'restarting_core':
        return 'Restarting daemon...';
      case 'rescanning':
        return 'Rescanning wallet...';
      default:
        return '';
    }
  };

  state = {
    status: this.statusMessage(this.props.bootstrapper.currentProgress()),
  };

  /**
   * Handle progress
   *
   * @memberof BootstrapBackgroundTask
   */
  handleProgress = (step, details) => {
    const status = this.statusMessage({
      step,
      details,
    });
    this.setState({ status });

    if (this.state.step === 'backing_up' && step === 'stopping_core') {
      this.props.showNotification('Your wallet has been backed up', 'success');
    }
  };

  /**
   * Handle Abort
   *
   * @memberof BootstrapBackgroundTask
   */
  handleAbort = () => {
    this.closeTask();
    this.props.showNotification(
      'Aborted recent database bootstrapping',
      'error'
    );
    this.props.showNotification('Daemon is restarting...');
  };

  /**
   * Handle Error
   *
   * @memberof BootstrapBackgroundTask
   */
  handleError = err => {
    this.closeTask();
    this.props.openErrorDialog({
      message: 'Error bootstrapping recent database',
      note: err.message || 'An unknown error occured',
    });
    this.props.showNotification('Daemon is restarting...');
    console.error(err);
  };

  /**
   * Handle Finish
   *
   * @memberof BootstrapBackgroundTask
   */
  handleFinish = () => {
    this.closeTask();
    this.props.openSuccessDialog({
      message: 'Recent database has been successfully updated',
    });
    this.props.showNotification('Daemon is restarting...');
  };

  /**
   * Handle Minimize
   *
   * @memberof BootstrapBackgroundTask
   */
  maximize = () => {
    this.props.openModal(BootstrapModal, {
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
        {this.state.status}
      </BootstrapBackgroundTaskComponent>
    );
  }
}
