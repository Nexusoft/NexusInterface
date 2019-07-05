import React from 'react';
import BackgroundTask from 'components/BackgroundTask';
import UIController from 'components/UIController';

export default class AutoUpdateBackgroundTask extends React.Component {
  confirmInstall = () => {
    this.closeTask();
    UIController.openConfirmDialog({
      question: 'Close the wallet and install update now?',
      labelYes: 'Close and install',
      callbackYes: this.props.quitAndInstall,
      labelNo: 'Install it later',
      callbackNo: () => {
        UIController.showBackgroundTask(AutoUpdateBackgroundTask, this.props);
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
