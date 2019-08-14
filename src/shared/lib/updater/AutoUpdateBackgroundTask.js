import React from 'react';
import { connect } from 'react-redux';
import BackgroundTask from 'components/BackgroundTask';
import { openConfirmDialog, showBackgroundTask } from 'actions/overlays';

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

  render() {
    return (
      <BackgroundTask
        type="success"
        assignClose={close => {
          this.closeTask = close;
        }}
        onClick={this.confirmInstall}
      >
        {__('New wallet version %{version} - Ready to install!', {
          version: this.props.version,
        })}
      </BackgroundTask>
    );
  }
}
