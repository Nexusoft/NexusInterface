// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal
import Text from 'components/Text';
import { updateSettings } from 'actions/settingsActionCreators';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';

const mapStateToProps = state => ({
  backupDir: state.settings.settings.Folder,
});

const mapDispatchToProps = dispatch => ({
  updateSettings: updates => dispatch(updateSettings(updates)),
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class SettingsApp extends Component {
  browseBackupDir = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Select a folder',
        defaultPath: this.props.backupDir,
        properties: ['openDirectory'],
      },
      folderPaths => {
        if (folderPaths && folderPaths.length > 0) {
          this.props.updateSettings({ Folder: folderPaths[0] });
        }
      }
    );
  };

  render() {
    return (
      <SettingsField connectLabel label={<Text id="Settings.Folder" />}>
        {inputId => (
          <div className="flex stretch">
            <TextField
              id={inputId}
              value={this.props.backupDir}
              readOnly
              style={{ flexGrow: 1 }}
            />
            <Button
              fitHeight
              onClick={this.browseBackupDir}
              style={{ marginLeft: '1em' }}
            >
              Browse
            </Button>
          </div>
        )}
      </SettingsField>
    );
  }
}
