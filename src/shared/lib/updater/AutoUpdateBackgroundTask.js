import React from 'react';
import { shell } from 'electron';

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

  goToGitHub = () => {
    this.closeTask();
    shell.openExternal(
      `https://github.com/Nexusoft/NexusInterface/releases/tag/${this.props.version}`
    );
  };

  render() {
    const { gitHub } = this.props;
    return (
      <BackgroundTask
        type="success"
        assignClose={close => {
          this.closeTask = close;
        }}
        onClick={gitHub ? this.goToGitHub : this.confirmInstall}
      >
        {gitHub
          ? __('New wallet version %{version} - Click here to download', {
              version: this.props.version,
            })
          : __('New wallet version %{version} - Click here to update', {
              version: this.props.version,
            })}
      </BackgroundTask>
    );
  }
}
