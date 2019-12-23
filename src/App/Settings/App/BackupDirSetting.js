// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

// Internal
import { updateSettings } from 'lib/settings';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';

__ = __context('Settings.Application');

const mapStateToProps = state => ({
  backupDir: state.settings.backupDirectory,
  locale: state.settings.locale,
});

/**
 * Backup Directory in Settings Page
 *
 * @class SettingsApp
 * @extends {Component}
 */
@connect(mapStateToProps)
class SettingsApp extends Component {
  /**
   * Open up Dialoge
   *
   * @memberof SettingsApp
   */
  browseBackupDir = async () => {
    const folderPaths = await ipcRenderer.invoke('show-open-dialog', {
      title: __('Select backup directory'),
      defaultPath: this.props.backupDir,
      properties: ['openDirectory'],
    });
    if (folderPaths && folderPaths.length > 0) {
      updateSettings({
        backupDirectory: folderPaths[0],
      });
    }
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsApp
   */
  render() {
    return (
      <SettingsField connectLabel label={__('Backup directory')}>
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
              {__('Browse')}
            </Button>
          </div>
        )}
      </SettingsField>
    );
  }
}
export default SettingsApp;
