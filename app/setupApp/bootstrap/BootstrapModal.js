// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import prettyBytes from 'pretty-bytes';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import UIController from 'components/UIController';
import ModalContext from 'context/modal';
import { timing } from 'styles';

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

@connect(state => ({
  locale: state.settings.settings.locale,
}))
class BootstrapModalContent extends Component {
  constructor(props) {
    super(props);
    props.bootstrapper.registerEvents({
      onProgress: this.handleProgress,
      onAbort: this.handleAbort,
      onError: this.handleError,
      onFinish: this.handleFinish,
    });
  }

  state = {
    step: null,
    percentage: 0,
    bytes: '',
  };

  handleProgress = (step, details) => {
    if (step !== this.state.step) this.setState({ step: step });

    if (this.state.step === 'backing_up' && step === 'stopping_core') {
      UIController.showNotification(
        'Your wallet has been backed up',
        'success'
      );
    }

    if (step === 'downloading') {
      const { downloaded, totalSize } = details || {};
      if (totalSize) {
        const percentage =
          Math.min(Math.round((1000 * downloaded) / totalSize), 1000) / 10;
        if (percentage !== this.state.percentage) this.setState({ percentage });

        const bytes = `${prettyBytes(
          downloaded,
          this.props.locale
        )} / ${prettyBytes(totalSize, this.props.locale)}`;
        if (bytes !== this.state.bytes) this.setState({ bytes });
      }
    }
  };

  handleAbort = () => {
    this.props.closeModal();
    UIController.showNotification(
      'Aborted bootstrapping recent database',
      'error'
    );
  };

  handleError = err => {
    this.props.closeModal();
    UIController.openErrorModal({
      message: 'Error bootstrapping recent database',
      note: err.message || 'An unknown error occured',
    });
    console.error(err);
  };

  handleFinish = () => {
    this.props.closeModal();
    UIController.openSuccessModal({
      message: 'Recent database has been successfully updated',
    });
    UIController.showNotification('Daemon is restarting...');
  };

  statusMessage = () => {
    const { step, percentage, bytes } = this.state;
    switch (step) {
      case 'backing_up':
        return 'Backing up your wallet...';
      case 'stopping_core':
        return 'Stopping daemon...';
      case 'downloading':
        return `Downloading the database... ${percentage}% ${
          bytes ? `(${bytes})` : ''
        }`;
      case 'extracting':
        return 'Uncompressing the database...';
      case 'finalizing':
        return 'Finalizing...';
      default:
        return ' ';
    }
  };

  confirmAbort = () => {
    UIController.openConfirmModal({
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

  render() {
    return (
      <>
        <p>{this.statusMessage()}</p>
        <ProgressBar percentage={this.state.percentage} />
        <div className="flex space-between" style={{ marginTop: '2em' }}>
          <div />
          <Button skin="error" onClick={this.confirmAbort}>
            Abort
          </Button>
        </div>
      </>
    );
  }
}

const BootstrapModal = props => (
  <Modal closeOnBackgroundClick={false}>
    {closeModal => (
      <Modal.Body>
        <Title>Bootstrap Recent Database</Title>
        <BootstrapModalContent {...props} closeModal={closeModal} />
      </Modal.Body>
    )}
  </Modal>
);

export default BootstrapModal;
