// External Dependencies
import React, { Component } from 'react';
import config from 'api/configuration';
import path from 'path';
import { connect } from 'react-redux';
import Text from 'components/Text';
import fs from 'fs';
import googleanalytics from 'scripts/googleanalytics';
import styled from '@emotion/styled';

// Internal Global Dependencies
import { GetSettings, SaveSettings } from 'api/settings';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import * as FlagFile from 'images/LanguageFlags';
import { remote as dialog } from 'electron';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import Switch from 'components/Switch';
import UIController from 'components/UIController';

// Internal Local Dependencies
import styles from './style.css';

const Flag = styled.img({
  marginRight: '.5em',
  verticalAlign: 'middle',
});

const AppSettings = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

const languages = [
  {
    value: 'en',
    display: (
      <span>
        <Flag src={FlagFile.America} />
        <span className="v-align">English (US)</span>
      </span>
    ),
  },
  {
    value: 'ru',
    display: (
      <span>
        <Flag src={FlagFile.Russia} />
        <span className="v-align">Pусский</span>
      </span>
    ),
  },
  {
    value: 'es',
    display: (
      <span>
        <Flag src={FlagFile.Spain} />
        <span className="v-align">Español</span>
      </span>
    ),
  },
  {
    value: 'ko',
    display: (
      <span>
        <Flag src={FlagFile.Korea} />
        <span className="v-align">한국어</span>
      </span>
    ),
  },
  {
    value: 'de',
    display: (
      <span>
        <Flag src={FlagFile.Germany} />
        <span className="v-align">Deutsch</span>
      </span>
    ),
  },
  {
    value: 'ja',
    display: (
      <span>
        <Flag src={FlagFile.Japan} />
        <span className="v-align">日本人</span>
      </span>
    ),
  },
  {
    value: 'fr',
    display: (
      <span>
        <Flag src={FlagFile.France} />
        <span className="v-align">Français</span>
      </span>
    ),
  },
];

const fiatCurrencies = [
  { value: 'AUD', display: 'Australian Dollar' },
  { value: 'BRL', display: 'Brazilian Real' },
  { value: 'GPB', display: 'British Pound' },
  { value: 'CAD', display: 'Canadian Dollar' },
  { value: 'CLP', display: 'Chilean Peso' },
  { value: 'CNY', display: 'Chinese Yuan' },
  { value: 'CZK', display: 'Czeck Koruna' },
  { value: 'EUR', display: 'Euro' },
  { value: 'HKD', display: 'Hong Kong Dollar' },
  { value: 'INR', display: 'Israeli Shekel' },
  { value: 'JPY', display: 'Japanese Yen' },
  { value: 'KRW', display: 'Korean Won' },
  { value: 'MYR', display: 'Malaysian Ringgit' },
  { value: 'MXN', display: 'Mexican Peso' },
  { value: 'NZD', display: 'New Zealand Dollar' },
  { value: 'PKR', display: 'Pakistan Rupee' },
  { value: 'RUB', display: 'Russian Ruble' },
  { value: 'SAR', display: 'Saudi Riyal' },
  { value: 'SGD', display: 'Singapore Dollar' },
  { value: 'ZAR', display: 'South African Rand' },
  { value: 'CHF', display: 'Swiss Franc' },
  { value: 'TWD', display: 'Taiwan Dollar' },
  { value: 'AED', display: 'United Arab Emirates Dirham' },
  { value: 'USD', display: 'United States Dollar' },
];

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.sendRecieve,
    ...state.settings,
    ...state.intl,
    ...state.overview,
  };
};
const mapDispatchToProps = dispatch => ({
  OpenModal2: type => {
    dispatch({ type: TYPE.SHOW_MODAL2, payload: type });
  },
  CloseModal2: type => {
    dispatch({ type: TYPE.HIDE_MODAL2, payload: type });
  },
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  setSettings: settings =>
    dispatch({ type: TYPE.SET_SETTINGS, payload: settings }),
  setFiatCurrency: inValue => {
    dispatch({ type: TYPE.SET_FIAT_CURRENCY, payload: inValue });
  },
  OpenModal3: type => {
    dispatch({ type: TYPE.SHOW_MODAL3, payload: type });
  },
  OpenModal4: type => {
    dispatch({ type: TYPE.SHOW_MODAL4, payload: type });
  },
  CloseModal4: type => {
    dispatch({ type: TYPE.HIDE_MODAL4, payload: type });
  },
  CloseModal3: type => {
    dispatch({ type: TYPE.HIDE_MODAL3, payload: type });
  },
  SwitchLocale: locale => {
    dispatch({ type: TYPE.SWITCH_LOCALES, payload: locale });
  },
  SwitchMessages: messages => {
    dispatch({ type: TYPE.SWITCH_MESSAGES, payload: messages });
  },
  SeeFolder: Folder => {
    dispatch({ type: TYPE.SEE_FOLDER, payload: Folder });
  },
  SetMinimumConfirmationsNumber: inValue => {
    dispatch({ type: TYPE.SET_MIN_CONFIRMATIONS, payload: inValue });
  },
  // OpenErrorModal: type => {
  //   dispatch({ type: TYPE.SHOW_ERROR_MODAL, payload: type });
  // },
  // CloseErrorModal: type => {
  //   dispatch({ type: TYPE.HIDE_ERROR_MODAL, payload: type });
  // },
});

var currentBackupLocation = ''; //Might redo to use redux but this is only used to replace using json reader every render;

class SettingsApp extends Component {
  // React Method (Life cycle hook)
  constructor(props) {
    super(props);
    // Set initial settings
    // This is a temporary fix for the current setting state mechanism
    // Ideally this should be managed via Redux states & actions
    const settings = GetSettings();
    this.initialValues = {
      minimizeToTray: !!settings.minimizeToTray,
      googlesetting: !!settings.googlesetting,
      devmode: !!settings.devmode,
      minConf: settings.minConf !== undefined ? settings.minConf : 3,
      txFee: props.paytxfee,
    };
  }

  componentDidMount() {
    if (this.refs.backupInputField) {
      this.refs.backupInputField.webkitdirectory = true;
      this.refs.backupInputField.directory = true;
    }
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    // Why?
    this.props.setSettings(GetSettings());
  }

  updateBackupLocation(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    let incomingPath = el.files[0].path;

    settingsObj.backupLocation = incomingPath;

    SaveSettings(settingsObj);
  }

  updateAutoStart(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.autostart = el.checked;

    SaveSettings(settingsObj);

    //This is the code that will create a reg to have the OS auto start the app
    var AutoLaunch = require('auto-launch');
    // Change Name when we need to
    var autolaunchsettings = new AutoLaunch({
      name: 'Nexus',
      path: path.dirname(app.getPath('exe')),
    });
    //No need for a path as it will be set automaticly

    //Check selector
    if (el.checked == true) {
      autolaunchsettings.enable();
      autolaunchsettings
        .isEnabled()
        .then(function(isEnabled) {
          if (isEnabled) {
            return;
          }
          autolaunchsettings.enable();
        })
        .catch(function(err) {
          // handle error
        });
    } else {
      // Will Remove the property that makes it auto play
      autolaunchsettings.disable();
    }
  }

  updateMinimizeToTray(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.minimizeToTray = el.checked;

    SaveSettings(settingsObj);
  }

  updateGoogleAnalytics(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.googleAnalytics = el.checked;

    if (el.checked == true) {
      googleanalytics.EnableAnalytics();

      googleanalytics.SendEvent('Settings', 'Analytics', 'Enabled', 1);
    } else {
      googleanalytics.SendEvent('Settings', 'Analytics', 'Disabled', 1);
      googleanalytics.DisableAnalytics();
    }

    SaveSettings(settingsObj);
  }

  updateOptionalTransactionFee(event) {
    var el = event.target;
    var settingsObj = GetSettings();
    settingsObj.optionalTransactionFee = el.value;

    SaveSettings(settingsObj);
  }

  setTxFee() {
    let TxFee = document.getElementById('optionalTransactionFee').value;
    if (parseFloat(TxFee) > 0) {
      RPC.PROMISE('settxfee', [parseFloat(TxFee)]);
      UIController.showNotification(
        <Text id="Alert.TransactionFeeSet" />,
        'success'
      );
    } else {
      UIController.openErrorDialog({
        message: <Text id="Alert.InvalidTransactionFee" />,
      });
    }
  }

  updateDefaultUnitAmount(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.defaultUnitAmount = el.options[el.selectedIndex].value;

    SaveSettings(settingsObj);
  }

  updateDeveloperMode(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.devMode = el.checked;

    SaveSettings(settingsObj);
  }

  updateMinimumConfirmations(event) {
    var el = event.target;
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    if (el.value <= 0) {
      el.value = 1;
    }
    if (Number.isInteger(el.value) == false) {
      el.value = parseInt(el.value);
    }

    settingsObj.minimumconfirmations = el.value;
    settings.SaveSettings(settingsObj);
    this.props.SetMinimumConfirmationsNumber(el.value);
  }

  returnCurrentBackupLocation() {
    let currentLocation = GetSettings();
    //set state for currentlocation and return it

    return 'Current Location: ' + currentLocation.backupLocation;
  }

  saveEmail() {
    var settingsObj = GetSettings();
    let emailFeild = document.getElementById('emailAddress');
    let emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailregex.test(emailFeild.value)) {
      settingsObj.email = emailFeild.value;
      SaveSettings(settingsObj);
    } else alert('Invalid Email');
  }

  backupWallet() {
    let now = new Date()
      .toString()
      .slice(0, 24)
      .split(' ')
      .reduce((a, b) => {
        return a + '_' + b;
      })
      .replace(/:/g, '_');

    let BackupDir = process.env.HOME + '/NexusBackups';
    if (process.platform === 'win32') {
      BackupDir = process.env.USERPROFILE + '/NexusBackups';
      BackupDir = BackupDir.replace(/\\/g, '/');
    }
    if (this.props.settings.Folder !== BackupDir) {
      BackupDir = this.props.settings.Folder;
    }

    let ifBackupDirExists = fs.existsSync(BackupDir);
    if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
      fs.mkdirSync(BackupDir);
    }

    RPC.PROMISE('backupwallet', [
      BackupDir + '/NexusBackup_' + now + '.dat',
    ]).then(payload => {
      this.props.CloseModal4();
      UIController.showNotification(
        <Text id="Alert.WalletBackedUp" />,
        'success'
      );
    });
  }

  OnFiatCurrencyChange(value) {
    this.props.setFiatCurrency(value);
    let settings = GetSettings();
    settings.fiatCurrency = value;
    this.props.setSettings(settings);
    SaveSettings(settings);
  }

  getFolder(folderPaths) {
    dialog.showOpenDialog(
      {
        title: 'Select a folder',
        properties: ['openDirectory'],
      },
      folderPaths => {
        if (folderPaths === undefined) {
          console.log('No destination folder selected');
          return;
        } else {
          let settings = GetSettings();
          settings.Folder = folderPaths.toString();
          this.props.SeeFolder(folderPaths[0]);

          this.props.setSettings(settings);
          SaveSettings(settings);
        }
      }
    );
  }

  changeLocale = locale => {
    let settings = GetSettings();
    settings.locale = locale;
    this.props.SwitchLocale(locale);
    SaveSettings(settings);
  };

  confirmSetTxFee = () => {
    UIController.openConfirmDialog({
      question: <Text id="Settings.SetFee" />,
      yesCallback: this.setTxFee,
    });
  };

  confirmBackupWallet = () => {
    UIController.openConfirmDialog({
      question: <Text id="Settings.BackupWallet" />,
      yesCallback: () => {
        if (this.props.connections !== undefined) {
          this.backupWallet();
        } else {
          UIController.openErrorDialog({
            message: 'Please wait for Daemon to load',
          });
        }
      },
    });
  };

  // Mandatory React method
  render() {
    var settingsObj = GetSettings();
    return (
      <AppSettings>
        <form>
          <SettingsField label={<Text id="Settings.Language" />}>
            <Select
              options={languages}
              value={this.props.settings.locale}
              onChange={this.changeLocale}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.MinimizeClose" />}
            subLabel={<Text id="ToolTip.MinimizeOnClose" />}
          >
            <Switch
              defaultChecked={this.initialValues.minimizeToTray}
              onChange={this.updateMinimizeToTray}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.UsageData" />}
            subLabel={<Text id="ToolTip.Usage" />}
          >
            <Switch
              defaultChecked={this.initialValues.googlesettings}
              onChange={this.updateGoogleAnalytics}
            />
          </SettingsField>

          <SettingsField label={<Text id="Settings.Fiat" />}>
            <Select
              value={this.props.settings.fiatCurrency}
              onChange={e => this.OnFiatCurrencyChange(e)}
              style={{ maxWidth: 260 }}
              options={fiatCurrencies}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.MinimumConfirmations" />}
            subLabel={<Text id="ToolTip.MinimumConfirmations" />}
          >
            <TextField
              type="number"
              defaultValue={this.initialValues.minConf}
              style={{ width: 75 }}
              step="1"
              min="1"
              onChange={this.updateMinimumConfirmations.bind(this)}
              onKeyPress={e => {
                e.preventDefault();
              }}
            />
          </SettingsField>

          {/*File */}
          <SettingsField connectLabel label={<Text id="Settings.Folder" />}>
            <TextField
              value={this.props.settings.Folder}
              onChange={e => this.props.SeeFolder(e.target.value)}
              onDoubleClick={e => {
                e.preventDefault();
                this.getFolder(this.props.settings.Folder[0]);
              }}
            />
          </SettingsField>

          {/* NEXUS FEE */}
          <SettingsField
            connectLabel
            label={<Text id="Settings.OptionalFee" />}
            subLabel={<Text id="ToolTip.OptionalFee" />}
          >
            {inputId => (
              <div className="flex stretch">
                <TextField
                  id={inputId}
                  type="number"
                  defaultValue={this.initialValues.txFee}
                  step="0.01"
                  min="0"
                  style={{ width: 100 }}
                />
                <Button
                  fitHeight
                  onClick={this.confirmSetTxFee}
                  style={{ marginLeft: '1em' }}
                >
                  Set
                </Button>
              </div>
            )}
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.DeveloperMode" />}
            subLabel={<Text id="ToolTip.DevMode" />}
          >
            <Switch
              defaultChecked={this.initialValues.devmode}
              onChange={this.updateDeveloperMode}
            />
          </SettingsField>

          <Button
            disabled={this.props.connections === undefined}
            style={{ marginTop: '2em' }}
            onClick={this.confirmBackupWallet}
          >
            <Text id="Settings.BackupWallet" />
          </Button>
        </form>
      </AppSettings>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsApp);
