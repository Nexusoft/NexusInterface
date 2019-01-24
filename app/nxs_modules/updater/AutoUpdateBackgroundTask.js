import React from 'react';
import BackgroundTask from 'components/BackgroundTask';
import UIController from 'components/UIController';

export default class AutoUpdateBackgroundTask extends React.Component {
  confirmInstall = () => {
    this.closeTask();
    UIController.openConfirmDialog({
      question: 'Close the wallet and install update now?',
      yesLabel: 'Close and install',
      yesCallback: this.props.quitAndInstall,
      noLabel: 'Install it later',
      noCallback: () => {
        UIController.showBackgroundTask(AutoUpdateBackgroundTask, this.props);
      },
    });
  };

  render() {
    return (
      <BackgroundTask
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
