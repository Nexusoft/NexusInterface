// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal
import Text, { translate } from 'components/Text';
import { updateSettings } from 'actions/settingsActionCreators';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';

const mapStateToProps = state => ({
  backupDir: state.settings.backupDirectory,
  locale: state.settings.locale,
});

const mapDispatchToProps = dispatch => ({
  updateSettings: updates => dispatch(updateSettings(updates)),
});

/**
 * Backup Directory in Settings Page
 *
 * @class SettingsApp
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  mapDispatchToProps
)
class SettingsApp extends Component {
  /**
   * Open up Dialoge
   *
   * @memberof SettingsApp
   */
  browseBackupDir = () => {
    remote.dialog.showOpenDialog(
      {
        title: translate('Settings.SelectBackupDirectory', this.props.locale),
        defaultPath: this.props.backupDir,
        properties: ['openDirectory'],
      },
      folderPaths => {
        if (folderPaths && folderPaths.length > 0) {
          this.props.updateSettings({
            backupDirectory: folderPaths[0],
          });
        }
      }
    );
  };

  /**
   * React Render
   *
   * @returns
   * @memberof SettingsApp
   */
  render() {
    return (
      <SettingsField connectLabel label={<Text id="Settings.BackupDir" />}>
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
export default SettingsApp;