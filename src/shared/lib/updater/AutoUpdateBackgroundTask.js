import React from 'react';
import { connect } from 'react-redux';
import BackgroundTask from 'components/BackgroundTask';
import { openConfirmDialog, showBackgroundTask } from 'actions/overlays';

@connect(
  null,
  openConfirmDialog,
  showBackgroundTask
)
export default class AutoUpdateBackgroundTask extends React.Component {
  confirmInstall = () => {
    this.closeTask();
    this.props.openConfirmDialog({
      question: 'Close the wallet and install update now?',
      labelYes: 'Close and install',
      callbackYes: this.props.quitAndInstall,
      labelNo: 'Install it later',
      callbackNo: () => {
        this.props.showBackgroundTask(AutoUpdateBackgroundTask, this.props);
      },
    });
  };

  render() {
    return (
      <BackgroundTask
        type="success"
        assignClose={close => {
          this.closeTask = close;
        }}
        onClick={this.confirmInstall}
      >
        New wallet version {this.props.version} - Ready to install!
      </BackgroundTask>
    );
  }
}
