// External
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import prettyBytes from 'utils/prettyBytes';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { showBackgroundTask, openConfirmDialog, removeModal } from 'lib/ui';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModalContext from 'context/modal';
import { bootstrapEvents, abortBootstrap } from 'lib/bootstrap';
import { timing } from 'styles';
import BootstrapBackgroundTask from 'components/BootstrapBackgroundTask';
import arrowUpLeftIcon from 'icons/arrow-up-left.svg';

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
    case 'moving_db':
    case 'restarting_core':
    case 'rescanning':
      return 100;
    default:
      return 0;
  }
}

function getStatusMsg({ step, details }, locale) {
  switch (step) {
    case 'backing_up':
      return __('Backing up your wallet...');
    case 'downloading':
      const { downloaded, totalSize } = details || {};
      const percentage = getPercentage({ step, details });
      const sizeProgress = totalSize
        ? `(${prettyBytes(downloaded, locale)} / ${prettyBytes(
            totalSize,
            locale
          )})`
        : '';
      return `${__(
        'Downloading the database'
      )}... ${percentage}% ${sizeProgress}`;
    case 'extracting':
      return __('Decompressing the database...');
    case 'stopping_core':
      return __('Stopping Nexus Core...');
    case 'moving_db':
      return __('Moving the database...');
    case 'restarting_core':
      return __('Restarting Nexus Core...');
    case 'rescanning':
      return __('Rescanning Wallet...');
    default:
      return '';
  }
}

/**
 * Bootstrap Modal
 *
 * @class BootstrapModal
 * @extends {PureComponent}
 */
@connect(state => ({
  statusMsg: getStatusMsg(state.bootstrap, state.settings.locale),
  percentage: getPercentage(state.bootstrap),
}))
class BootstrapModal extends PureComponent {
  static contextType = ModalContext;

  modalRef = React.createRef();
  backgroundRef = React.createRef();

  componentDidMount() {
    bootstrapEvents.on('abort', this.closeModal);
    bootstrapEvents.on('error', this.closeModal);
    bootstrapEvents.on('success', this.closeModal);
  }

  componentWillUnmount() {
    bootstrapEvents.off('abort', this.closeModal);
    bootstrapEvents.off('error', this.closeModal);
    bootstrapEvents.off('success', this.closeModal);
  }

  /**
   * Handle Confrim Abort
   *
   * @memberof BootstrapModal
   */
  confirmAbort = () => {
    openConfirmDialog({
      question: __('Are you sure you want to abort the process?'),
      labelYes: __('Yes, abort'),
      skinYes: 'danger',
      callbackYes: abortBootstrap,
      labelNo: __('No, let it continue'),
      skinNo: 'primary',
    });
  };

  /**
   * Handle Minimize
   *
   * @memberof BootstrapModal
   */
  minimize = () => {
    showBackgroundTask(BootstrapBackgroundTask);

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
    removeModal(modalID);
  };

  handleKeyDown = e => {
    if (e.key === 'Escape') {
      this.minimize();
    }
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof BootstrapModal
   */
  render() {
    const { statusMsg, percentage, ...rest } = this.props;
    return (
      <BootstrapModalComponent
        modalRef={this.modalRef}
        backgroundRef={this.backgroundRef}
        onBackgroundClick={this.minimize}
        onKeyDown={this.handleKeyDown}
        assignClose={closeModal => (this.closeModal = closeModal)}
        {...rest}
      >
        <Modal.Body>
          <Title>{__('Bootstrap Recent Database')}</Title>
          <p>{statusMsg}</p>
          <ProgressBar percentage={percentage} />
          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <div />
            <Button skin="danger" onClick={this.confirmAbort}>
              {__('Abort')}
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
