import { Component } from 'react';
import { shell } from 'electron';

import BackgroundTask from 'components/BackgroundTask';
import { showBackgroundTask } from 'lib/ui';
import { confirm } from 'lib/dialog';

__ = __context('AutoUpdate');

export default class AutoUpdateBackgroundTask extends Component {
  confirmInstall = async () => {
    this.closeTask();
    const confirmed = await confirm({
      question: __('Close the wallet and install update now?'),
      labelYes: __('Close and install'),
      labelNo: __('Install it later'),
    });
    if (confirmed) {
      this.props.quitAndInstall();
    } else {
      showBackgroundTask(AutoUpdateBackgroundTask, this.props);
    }
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
        assignClose={(close) => {
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
