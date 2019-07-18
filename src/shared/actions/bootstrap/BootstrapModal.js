// External
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import {
  showBackgroundTask,
  showNotification,
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
} from 'actions/overlays';
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
  border: `1px solid ${theme.mixer(0.5)}`,
  overflow: 'hidden',
  animation:
    percentage >= 100
      ? `pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1)`
      : null,
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
  color: theme.mixer(0.5),
  transition: `color ${timing.normal}`,
  '&:hover': {
    color: theme.mixer(0.75),
  },
}));

/**
 * Bootstrap Modal
 *
 * @class BootstrapModal
 * @extends {PureComponent}
 */
@connect(
  state => ({
    locale: state.settings.locale,
  }),
  {
    showBackgroundTask,
    showNotification,
    openConfirmDialog,
    openErrorDialog,
    openSuccessDialog,
    removeModal,
  }
)
class BootstrapModal extends PureComponent {
  static contextType = ModalContext;

  modalRef = React.createRef();
  backgroundRef = React.createRef();

  datapoints = [];

  /**
   *Creates an instance of BootstrapModal.
   * @param {*} props
   * @memberof BootstrapModal
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
   * @memberof BootstrapModal
   */
  statusMessage = ({ step, details }) => {
    switch (step) {
      case 'backing_up':
        return 'Backing up your wallet...';
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
      case 'stopping_core':
        return 'Stopping Nexus Core...';
      case 'moving_db':
        return 'Moving the database...';
      case 'restarting_core':
        return 'Restarting Nexus Core...';
      case 'rescanning':
        return 'Rescanning Wallet...';
      default:
        return '';
    }
  };

  state = {
    status: this.statusMessage(this.props.bootstrapper.currentProgress()),
    percentage: 0,
  };

  /**
   * Handle Progress
   *
   * @memberof BootstrapModal
   */
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
      this.props.showNotification('Your wallet has been backed up', 'success');
    }
  };

  /**
   * Handle Abort
   *
   * @memberof BootstrapModal
   */
  handleAbort = () => {
    this.closeModal();
    this.props.showNotification(
      'Aborted recent database bootstrapping',
      'error'
    );
    this.props.showNotification('Nexus Core is restarting...');
  };

  /**
   * Handle Error
   *
   * @memberof BootstrapModal
   */
  handleError = err => {
    this.closeModal();
    this.props.openErrorDialog({
      message: 'Error bootstrapping recent database',
      note: err.message || 'An unknown error occured',
    });
    this.props.showNotification('Nexus Core is restarting...');
    console.error(err);
  };

  /**
   * Handle Finish
   *
   * @memberof BootstrapModal
   */
  handleFinish = () => {
    this.closeModal();
    this.props.openSuccessDialog({
      message: 'Recent database has been successfully updated',
    });
    this.props.showNotification('Nexus Core is restarting...');
  };

  /**
   * Handle Confrim Abort
   *
   * @memberof BootstrapModal
   */
  confirmAbort = () => {
    this.props.openConfirmDialog({
      question: 'Are you sure you want to abort the process?',
      labelYes: 'Yes, abort',
      skinYes: 'danger',
      callbackYes: () => {
        this.props.bootstrapper.abort();
      },
      labelNo: 'No, let it continue',
      skinNo: 'primary',
    });
  };

  /**
   * Handle Minimize
   *
   * @memberof BootstrapModal
   */
  minimize = () => {
    this.props.showBackgroundTask(BootstrapBackgroundTask, {
      bootstrapper: this.props.bootstrapper,
    });

    const duration = parseInt(timing.quick);
    const options = { duration, easing: 'linear', fill: 'both' };
    this.modalRef.current.animate(minimizeAnimation, options);
    this.backgroundRef.current.animate(fadeOut, options);
    setTimeout(this.remove, duration);
  };

  /**
   * Handle Remove
   *
   * @memberof BootstrapModal
   */
  remove = () => {
    const modalID = this.context;
    this.props.removeModal(modalID);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof BootstrapModal
   */
  render() {
    let percentage = this.state.status.includes('Downloading')
      ? this.state.percentage
      : 100;
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
          <ProgressBar percentage={percentage} />
          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <div />
            <Button skin="danger" onClick={this.confirmAbort}>
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
export default BootstrapModal;
