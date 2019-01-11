// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import UIController from 'components/UIController';
import BackgroundTask from 'components/BackgroundTask';
import { animations, timing } from 'styles';
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

export default class BootstrapBackgroundTask extends Component {
  constructor(props) {
    super(props);
    props.bootstrapper.registerEvents({
      onProgress: this.handleProgress,
      onAbort: this.handleAbort,
      onError: this.handleError,
      onFinish: this.handleFinish,
    });
  }

  statusMessage = ({ step, details }) => {
    switch (step) {
      case 'backing_up':
        return 'Backing up...';
      case 'stopping_core':
        return 'Stopping daemon...';
      case 'downloading':
        const { downloaded, totalSize } = details || {};
        const percentage = totalSize
          ? Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10
          : 0;
        return `Downloading... ${percentage}%`;
      case 'extracting':
        return 'Decompressing...';
      case 'finalizing':
        return 'Finalizing...';
      default:
        return '';
    }
  };

  state = {
    status: this.statusMessage(this.props.bootstrapper.currentProgress()),
  };

  handleProgress = (step, details) => {
    const status = this.statusMessage({
      step,
      details,
    });
    this.setState({ status });

    if (this.state.step === 'backing_up' && step === 'stopping_core') {
      UIController.showNotification(
        'Your wallet has been backed up',
        'success'
      );
    }
  };

  handleAbort = () => {
    this.closeTask();
    UIController.showNotification(
      'Aborted recent database bootstrapping',
      'error'
    );
    UIController.showNotification('Daemon is restarting...');
  };

  handleError = err => {
    this.closeTask();
    UIController.openErrorDialog({
      message: 'Error bootstrapping recent database',
      note: err.message || 'An unknown error occured',
    });
    UIController.showNotification('Daemon is restarting...');
    console.error(err);
  };

  handleFinish = () => {
    this.closeTask();
    UIController.openSuccessDialog({
      message: 'Recent database has been successfully updated',
    });
    UIController.showNotification('Daemon is restarting...');
  };

  maximize = () => {
    UIController.openModal(BootstrapModal, {
      bootstrapper: this.props.bootstrapper,
      maximizedFromBackground: true,
    });
    this.closeTask();
  };

  render() {
    return (
      <BootstrapBackgroundTaskComponent
        assignClose={closeTask => (this.closeTask = closeTask)}
        onClick={this.maximize}
        index={this.props.index}
      >
        {this.state.status}
      </BootstrapBackgroundTaskComponent>
    );
  }
}
