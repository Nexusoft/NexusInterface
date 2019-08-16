import React from 'react';
import { connect } from 'react-redux';
import BackgroundTask from 'components/BackgroundTask';
import { openConfirmDialog, showBackgroundTask } from 'actions/overlays';
import { shell, remote } from 'electron';

@connect(
  null,
  {
    openConfirmDialog,
    showBackgroundTask,
  }
)
export default class AutoUpdateBackgroundTask extends React.Component {
  confirmInstall = () => {
    this.closeTask();
    this.props.openConfirmDialog({
      question: __('Close the wallet and install update now?'),
      labelYes: __('Close and install'),
      callbackYes: this.props.quitAndInstall,
      labelNo: __('Install it later'),
      callbackNo: () => {
        this.props.showBackgroundTask(AutoUpdateBackgroundTask, this.props);
      },
    });
  };

  exitToGitHub = () => {
    this.closeTask();
    this.props.openConfirmDialog({
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
        this.props.showBackgroundTask(AutoUpdateBackgroundTask, this.props);
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
