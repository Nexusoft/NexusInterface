import React from 'react';
import { shell, remote } from 'electron';

import BackgroundTask from 'components/BackgroundTask';
import { openConfirmDialog, showBackgroundTask } from 'lib/ui';
import { closeWallet } from 'lib/wallet';

export default class AutoUpdateBackgroundTask extends React.Component {
  confirmInstall = () => {
    this.closeTask();
    openConfirmDialog({
      question: __('Close the wallet and install update now?'),
      labelYes: __('Close and install'),
      callbackYes: () => {
        closeWallet(this.props.quitAndInstall);
      },
      labelNo: __('Install it later'),
      callbackNo: () => {
        showBackgroundTask(AutoUpdateBackgroundTask, this.props);
      },
    });
  };

  exitToGitHub = () => {
    this.closeTask();
    openConfirmDialog({
      question: __('Close the wallet and go to GitHub?'),
      labelYes: __('Close and go to Github'),
      callbackYes: () => {
        shell.openExternal(
          'https://github.com/Nexusoft/NexusInterface/releases'
        );
        remote.app.quit();
      },
      labelNo: __('Install it later'),
      callbackNo: () => {
        showBackgroundTask(AutoUpdateBackgroundTask, this.props);
      },
    });
  };

  render() {
    const { gitHub } = this.props;
    return (
      <BackgroundTask
        type="success"
        assignClose={close => {
          this.closeTask = close;
        }}
        onClick={gitHub ? this.exitToGitHub : this.confirmInstall}
      >
        {__('New wallet version %{version} - Ready to install!', {
          version: this.props.version,
        })}
      </BackgroundTask>
    );
  }
}
