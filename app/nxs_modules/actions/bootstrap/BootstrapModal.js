// External
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import UIController from 'components/UIController';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModalContext from 'context/modal';
import { timing } from 'styles';
import BootstrapBackgroundTask from './BootstrapBackgroundTask';
import arrowUpLeftIcon from 'images/arrow-up-left.sprite.svg';

const maximizeAnimation = keyframes`
  from { 
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
    top: 25%;
    left: 25%;
  }
  to { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    top: 50%;
    left: 50%;
  }
`;

const minimizeAnimation = {
  transform: [
    'translate(-50%, -50%) scale(1)',
    'translate(-50%, -50%) scale(0.3)',
  ],
  opacity: [1, 0],
  top: ['50%', '25%'],
  left: ['50%', '25%'],
};

const fadeOut = {
  opacity: [1, 0],
};

const BootstrapModalComponent = styled(Modal)(
  ({ maximizedFromBackground }) =>
    maximizedFromBackground && {
      animation: `${maximizeAnimation} ${timing.quick} linear`,
    }
);

const Title = styled.div({
  fontSize: 28,
});

const ProgressBar = styled.div(({ percentage, theme }) => ({
  height: 20,
  borderRadius: 10,
  border: `1px solid ${theme.gray}`,
  overflow: 'hidden',

  '&::before': {
    content: '""',
    display: 'block',
    background: theme.primary,
    height: '100%',
    width: '100%',
    transformOrigin: 'left center',
    transform: `scaleX(${percentage / 100})`,
    transition: `transform ${timing.normal}`,
  },
}));

const MinimizeIcon = styled(Icon)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  left: 10,
  fontSize: 10,
  cursor: 'pointer',
  color: theme.gray,
  transition: `color ${timing.normal}`,
  '&:hover': {
    color: theme.lightGray,
  },
}));

@connect(state => ({
  locale: state.settings.settings.locale,
}))
export default class BootstrapModal extends PureComponent {
  static contextType = ModalContext;

  modalRef = React.createRef();
  backgroundRef = React.createRef();

  datapoints = [];

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
        return 'Backing up your wallet...';
      case 'stopping_core':
        return 'Stopping daemon...';
      case 'downloading':
        const { locale } = this.props;
        const { downloaded, totalSize } = details || {};
        const percentage = totalSize
          ? Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10
          : 0;
        const sizeProgress = totalSize
          ? `(${prettyBytes(downloaded, locale)} / ${prettyBytes(
              totalSize,
              locale
            )})`
          : '';
          /*
          const lastDataPoint = this.datapoints[this.datapoints.length - 1] || 0;
          const tempdatapoint = (percentage - lastDataPoint).toFixed(4);
          this.datapoints.push(Number.parseFloat(tempdatapoint));
          let sum = 0;
          for (let index = 0; index < this.datapoints.length; index++) {
          const element = this.datapoints[index];
          sum += element;
          }
          const downloadSpeedAverage  = ((sum / datapoints.length)/100) * totalSize;
          const timeremain = (totalSize * ((100 - percentage) / 100)) / downloadSpeedAverage ; */
          const timeremain = '';

        return `Downloading the database... ${percentage}% ${sizeProgress} ${timeremain}`;
      case 'extracting':
        return 'Decompressing the database...';
      case 'finalizing':
        return 'Finalizing...';
      default:
        return '';
    }
  };

  state = {
    status: this.statusMessage(this.props.bootstrapper.currentProgress()),
    percentage: 0,
  };

  handleProgress = (step, details) => {
    const status = this.statusMessage({ step, details });
    this.setState({ status });

    if (step === 'downloading') {
      const { downloaded, totalSize } = details || {};
      if (totalSize) {
        const percentage =
          Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10;
        this.setState({ percentage });
      }
    }

    if (this.state.step === 'backing_up' && step === 'stopping_core') {
      UIController.showNotification(
        'Your wallet has been backed up',
        'success'
      );
    }
  };

  handleAbort = () => {
    this.closeModal();
    UIController.showNotification(
      'Aborted recent database bootstrapping',
      'error'
    );
    UIController.showNotification('Daemon is restarting...');
  };

  handleError = err => {
    this.closeModal();
    UIController.openErrorDialog({
      message: 'Error bootstrapping recent database',
      note: err.message || 'An unknown error occured',
    });
    UIController.showNotification('Daemon is restarting...');
    console.error(err);
  };

  handleFinish = () => {
    this.closeModal();
    UIController.openSuccessDialog({
      message: 'Recent database has been successfully updated',
    });
    UIController.showNotification('Daemon is restarting...');
  };

  confirmAbort = () => {
    UIController.openConfirmDialog({
      question: 'Are you sure you want to abort the process?',
      yesLabel: 'Yes, abort',
      yesSkin: 'error',
      yesCallback: () => {
        this.props.bootstrapper.abort();
      },
      noLabel: 'No, let it continue',
      noSkin: 'primary',
    });
  };

  minimize = () => {
    UIController.showBackgroundTask(BootstrapBackgroundTask, {
      bootstrapper: this.props.bootstrapper,
    });

    const duration = parseInt(timing.quick);
    const options = { duration, easing: 'linear', fill: 'both' };
    this.modalRef.current.animate(minimizeAnimation, options);
    this.backgroundRef.current.animate(fadeOut, options);
    setTimeout(this.remove, duration);
  };

  remove = () => {
    const modalID = this.context;
    UIController.removeModal(modalID);
  };

  render() {
    return (
      <BootstrapModalComponent
        modalRef={this.modalRef}
        backgroundRef={this.backgroundRef}
        onBackgroundClick={this.minimize}
        assignClose={closeModal => (this.closeModal = closeModal)}
        {...this.props}
      >
        <Modal.Body>
          <Title>Bootstrap Recent Database</Title>
          <p>{this.state.status}</p>
          <ProgressBar percentage={this.state.percentage} />
          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <div />
            <Button skin="error" onClick={this.confirmAbort}>
              Abort
            </Button>
          </div>
          <Tooltip.Trigger tooltip="Minimize">
            <MinimizeIcon onClick={this.minimize} icon={arrowUpLeftIcon} />
          </Tooltip.Trigger>
        </Modal.Body>
      </BootstrapModalComponent>
    );
  }
}
