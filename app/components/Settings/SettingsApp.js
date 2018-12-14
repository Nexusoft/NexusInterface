/*
  Title: App settings
  Description: Control App settings.
  Last Modified by: Brian Smith
*/
// External Dependencies

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import config from 'api/configuration';
import { access } from 'fs';
import path from 'path';
import Modal from 'react-responsive-modal';

import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
// Internal Dependencies
import fs from 'fs';
import styles from './style.css';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import ContextMenuBuilder from 'contextmenu';
import plusimg from 'images/plus.svg';
import * as FlagFile from 'languages/LanguageFlags';
const { dialog } = require('electron').remote;

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
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings }),
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
  localeChange: returnSelectedLocale => {
    dispatch({ type: TYPE.SWITCH_LOCALES, payload: returnSelectedLocale });
  },
  SwitchLocale: locale => {
    dispatch({ type: TYPE.UPDATE_LOCALES, payload: locale });
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
});

var currentBackupLocation = ''; //Might redo to use redux but this is only used to replace using json reader every render;

class SettingsApp extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    var settings = require('api/settings.js').GetSettings();
    // this.setDefaultUnitAmount(settings);
    //Application settings
    // this.setAutostart(settings)
    this.setMinimizeToTray(settings);
    this.setGoogleAnalytics(settings);
    this.setDeveloperMode(settings);
    this.setInfoPopup(settings);
    this.setMinimumConfirmations(settings);
    this.setSavedTxFee(settings);

    if (this.refs.backupInputField) {
      this.refs.backupInputField.webkitdirectory = true;
      this.refs.backupInputField.directory = true;
    }

    var minConf = document.getElementById('minimumConfirmations');
    minConf.addEventListener('keypress', event => {
      event.preventDefault();
    });
    //this.OnFiatCurrencyChange = this.OnFiatCurrencyChange.bind(this);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    this.props.setSettings(require('api/settings.js').GetSettings());
    var minConf = document.getElementById('minimumConfirmations');
    minConf.removeEventListener('keypress', event => {
      event.preventDefault();
    });
  }

  // Class Methods
  setAutostart(settings) {
    var autostart = document.getElementById('autostart');

    if (settings.autostart === undefined) {
      autostart.checked = false;
    }
    if (settings.autostart == true) {
      autostart.checked = true;
    }
    if (settings.autostart == false) {
      autostart.checked = false;
    }
  }

  setMinimizeToTray(settings) {
    var minimizeToTray = document.getElementById('minimizeToTray');

    if (settings.minimizeToTray === undefined) {
      minimizeToTray.checked = false;
    }
    if (settings.minimizeToTray == true) {
      minimizeToTray.checked = true;
    }
    if (settings.minimizeToTray == false) {
      minimizeToTray.checked = false;
    }
  }

  setGoogleAnalytics(settings) {
    var googlesetting = document.getElementById('googleAnalytics');

    if (settings.googleAnalytics === undefined) {
      googlesetting.checked = true;
    }
    if (settings.googleAnalytics == true) {
      googlesetting.checked = true;
    }
    if (settings.googleAnalytics == false) {
      googlesetting.checked = false;
    }
  }
  // TODO: Finish this method.
  // setDefaultUnitAmount(settings) {
  //   var defaultUnitAmount = document.getElementById("defaultUnitAmount");

  //   if (settings.defaultUnitAmount === undefined) {
  //     defaultUnitAmount.value = "NXS";
  //   } else {
  //     defaultUnitAmount.value = settings.defaultUnitAmount;
  //   }
  // }

  setDeveloperMode(settings) {
    var devmode = document.getElementById('devmode');

    if (settings.devMode == true) {
      devmode.checked = true;
    }
  }

  setMinimumConfirmations(settings) {
    var minConf = document.getElementById('minimumConfirmations');

    if (settings.minimumconfirmations !== undefined) {
      minConf.value = settings.minimumconfirmations;
    } else {
      minConf.value = 3; //Default
    }
  }

  setInfoPopup(settings) {
    var infopop = document.getElementById('infoPopUps');

    if (settings.infopopups == true || settings.infopopups) {
      infopop.checked = true;
    }
  }

  setSavedTxFee(settings) {
    let settxobj = document.getElementById('optionalTransactionFee');
    settxobj.value = this.props.paytxfee;
  }

  updateBackupLocation(event) {
    var el = event.target;
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    let incomingPath = el.files[0].path;

    settingsObj.backupLocation = incomingPath;

    settings.SaveSettings(settingsObj);
  }

  updateAutoStart(event) {
    var el = event.target;
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    settingsObj.autostart = el.checked;

    settings.SaveSettings(settingsObj);

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
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    settingsObj.minimizeToTray = el.checked;

    settings.SaveSettings(settingsObj);
  }

  updateGoogleAnalytics(event) {
    var el = event.target;
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    settingsObj.googleAnalytics = el.checked;

    if (el.checked == true) {
      this.props.googleanalytics.EnableAnalytics();

      this.props.googleanalytics.SendEvent(
        'Settings',
        'Analytics',
        'Enabled',
        1
      );
    } else {
      this.props.googleanalytics.SendEvent(
        'Settings',
        'Analytics',
        'Disabled',
        1
      );
      this.props.googleanalytics.DisableAnalytics();
    }

    settings.SaveSettings(settingsObj);
  }

  updateOptionalTransactionFee(event) {
    var el = event.target;
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();
    settingsObj.optionalTransactionFee = el.value;

    settings.SaveSettings(settingsObj);
  }

  setTxFee() {
    let TxFee = document.getElementById('optionalTransactionFee').value;
    if (parseFloat(TxFee) > 0) {
      RPC.PROMISE('settxfee', [parseFloat(TxFee)]);
      this.props.OpenModal('Transaction Fee Set');
      setTimeout(() => this.props.CloseModal(), 3000);
    } else {
      this.props.OpenModal('Invalid Transaction Fee');
      setTimeout(() => this.props.CloseModal(), 3000);
    }
  }

  updateDefaultUnitAmount(event) {
    var el = event.target;
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    settingsObj.defaultUnitAmount = el.options[el.selectedIndex].value;

    settings.SaveSettings(settingsObj);
  }

  updateDeveloperMode(event) {
    var el = event.target;
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    settingsObj.devMode = el.checked;

    settings.SaveSettings(settingsObj);
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
    let currentLocation = require('api/settings.js').GetSettings();
    //set state for currentlocation and return it

    return 'Current Location: ' + currentLocation.backupLocation;
  }

  saveEmail() {
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();
    let emailFeild = document.getElementById('emailAddress');
    let emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailregex.test(emailFeild.value)) {
      settingsObj.email = emailFeild.value;
      settings.SaveSettings(settingsObj);
    } else alert('Invalid Email');
  }

  backupWallet(e) {
    e.preventDefault();
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

    let fs = require('fs');
    let ifBackupDirExists = fs.existsSync(BackupDir);
    if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
      fs.mkdirSync(BackupDir);
    }

    RPC.PROMISE('backupwallet', [
      BackupDir + '/NexusBackup_' + now + '.dat',
    ]).then(payload => {
      this.props.CloseModal4();
      this.props.OpenModal('Wallet Backup');
      setTimeout(() => this.props.CloseModal(), 3000);
    });
    console.log(this.props.settings.Folder);
  }

  OnFiatCurrencyChange(e) {
    this.props.setFiatCurrency(e.target.value);
    let settings = require('api/settings.js').GetSettings();
    settings.fiatCurrency = e.target.value;
    this.props.setSettings(settings);
    require('api/settings.js').SaveSettings(settings);
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
          let settings = require('api/settings.js').GetSettings();
          settings.Folder = folderPaths.toString();
          this.props.SeeFolder(folderPaths[0]);

          this.props.setSettings(settings);
          require('api/settings.js').SaveSettings(settings);
        }
      }
    );
  }

  changeLocale(locale) {
    let settings = require('api/settings.js').GetSettings();
    settings.locale = locale;
    this.props.setSettings(settings);
    this.props.SwitchLocale(locale);
    let messages = {};
    if (process.env.NODE_ENV === 'development') {
      messages = JSON.parse(fs.readFileSync(`app/languages/${locale}.json`));
    } else {
      messages = JSON.parse(
        fs.readFileSync(
          path.join(config.GetAppResourceDir(), 'languages', `${locale}.json`)
        )
      );
    }

    this.props.SwitchMessages(messages);
    require('api/settings.js').SaveSettings(settings);
  }

  // Mandatory React method
  render() {
    var settings = require('api/settings.js');
    var settingsObj = settings.GetSettings();

    return (
      <section id="application">
        <Modal
          center
          classNames={{ modal: 'custom-modal2', overlay: 'custom-overlay' }}
          showCloseIcon={false}
          open={this.props.openSecondModal}
          onClose={this.props.CloseModal2}
        >
          <div>
            <h2>
              <FormattedMessage
                id="Settings.SetFee"
                defaultMessage="Set Transaction Fee?"
              />
            </h2>
            <FormattedMessage id="Settings.Yes">
              {yes => (
                <input
                  value={yes}
                  type="button"
                  className="button primary"
                  onClick={() => {
                    this.setTxFee();
                    this.props.CloseModal2();
                  }}
                />
              )}
            </FormattedMessage>
            <div id="no-button">
              <FormattedMessage id="Settings.No">
                {no => (
                  <input
                    value={no}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        </Modal>
        <Modal
          center
          classNames={{ modal: 'custom-modal2', overlay: 'custom-overlay' }}
          showCloseIcon={false}
          open={this.props.openFourthModal}
          onClose={this.props.CloseModal4}
        >
          <div>
            <h2>
              <FormattedMessage
                id="Settings.BackupWallet"
                defaultMessage="Backup Wallet?"
              />
            </h2>
            <FormattedMessage id="Settings.Yes">
              {yes => (
                <input
                  value={yes}
                  type="button"
                  className="button primary"
                  onClick={e => {
                    if (this.props.connections !== undefined) {
                      this.backupWallet(e);
                    } else {
                      this.props.OpenModal('Please wait for Daemon to load');
                    }
                  }}
                />
              )}
            </FormattedMessage>
            <div id="no-button">
              <FormattedMessage id="Settings.No">
                {no => (
                  <input
                    value={no}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.props.CloseModal4();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        </Modal>
        <form className="aligned">
          {/* <div className="field">
            <label htmlFor="autostart">
              <FormattedMessage
                id="Settings.StartUp"
                defaultMessage="Start at system startup"
              />
            </label>
            <FormattedMessage
              id="ToolTip.SystemStartUP"
              defaultMessage="Automatically start the wallet when you log into your system"
            >
              {tt => (
                <input
                  id="autostart"
                  type="checkbox"
                  className="switch"
                  onChange={this.updateAutoStart}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div> */}

          <div className="field">
            <label htmlFor="minimizeToTray">
              <FormattedMessage
                id="Settings.MinimizeClose"
                defaultMessage="Minimize On Close"
              />
            </label>
            <FormattedMessage
              id="ToolTip.MinimizeOnClose"
              defaultMessage="Minimize the wallet when closing the window instead of closing it"
            >
              {tt => (
                <input
                  id="minimizeToTray"
                  type="checkbox"
                  className="switch"
                  onChange={this.updateMinimizeToTray}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div>

          <div className="field">
            <label htmlFor="googleAnalytics">
              <FormattedMessage
                id="Settings.UsageData"
                defaultMessage="Send anonymous usage data"
              />
            </label>
            <FormattedMessage
              id="ToolTip.Usage"
              defaultMessage="Send anonymous usage data to allow the Nexus developers to improve the wallet"
            >
              {tt => (
                <input
                  id="googleAnalytics"
                  type="checkbox"
                  className="switch"
                  onChange={this.updateGoogleAnalytics.bind(this)}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div>

          <div className="field">
            <label htmlFor="fiatDefualt">
              <FormattedMessage
                id="Settings.Fiat"
                defaultMessage="Fiat Currency"
              />
            </label>
            <select
              ref="fiatSelector"
              id="fiatSelector"
              value={this.props.settings.fiatCurrency}
              onChange={e => this.OnFiatCurrencyChange(e)}
            >
              <option key="AUD" value="AUD">
                Australian Dollar
              </option>
              <option key="BRL" value="BRL">
                Brazilian Real
              </option>
              <option key="GPB" value="GPB">
                British Pound
              </option>
              <option key="CAD" value="CAD">
                Canadian Dollar
              </option>
              <option key="CLP" value="CLP">
                Chilean Peso
              </option>
              <option key="CNY" value="CNY">
                Chinese Yuan
              </option>
              <option key="CZK" value="CZK">
                Czeck Koruna
              </option>
              <option key="EUR" value="EUR">
                Euro
              </option>
              <option key="HKD" value="HKD">
                Hong Kong Dollar
              </option>
              <option key="INR" value="INR">
                Israeli Shekel
              </option>
              <option key="JPY" value="JPY">
                Japanese Yen
              </option>
              <option key="KRW" value="KRW">
                Korean Won
              </option>
              <option key="MYR" value="MYR">
                Malaysian Ringgit
              </option>
              <option key="MXN" value="MXN">
                Mexican Peso
              </option>
              <option key="NZD" value="NZD">
                New Zealand Dollar
              </option>
              <option key="PKR" value="PKR">
                Pakistan Rupee
              </option>
              <option key="RUB" value="RUB">
                Russian Ruble
              </option>
              <option key="SAR" value="SAR">
                Saudi Riyal
              </option>
              <option key="SGD" value="SGD">
                Singapore Dollar
              </option>
              <option key="ZAR" value="ZAR">
                South African Rand
              </option>
              <option key="CHF" value="CHF">
                Swiss Franc
              </option>
              <option key="TWD" value="TWD">
                Taiwan Dollar
              </option>
              <option key="AED" value="AED">
                United Arab Emirates Dirham
              </option>
              <option key="USD" value="USD">
                United States Dollar
              </option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="minimumConfirmationsLable">
              <FormattedMessage
                id="Settings.MinimumConfirmations"
                defaultMessage="Minimum Confirmations"
              />
            </label>
            <FormattedMessage
              id="ToolTip.MinimumConfirmations"
              defaultMessage="Minimum amount of confirmations before a block is accepted. Local Only."
            >
              {tt => (
                <input
                  id="minimumConfirmations"
                  type="number"
                  size="3"
                  step="1"
                  min="1"
                  onChange={this.updateMinimumConfirmations.bind(this)}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div>
          {/*File */}
          <div className="field">
            <label htmlFor="Folder">
              <FormattedMessage
                id="Settings.Folder"
                defaultMessage="Backup Directory"
              />
            </label>
            <div className="fee">
              <input
                className="Folder"
                type="text"
                value={this.props.settings.Folder}
                onChange={e => this.props.SeeFolder(e.target.value)}
                onClick={e => {
                  e.preventDefault();
                  this.getFolder(this.props.settings.Folder[0]);
                }}
              />

              {/* <button
                  className="feebutton"
                  onClick={e => {
                    e.preventDefault();
                    this.getFolder(this.props.settings.Folder[0]);
                  }}
                >
                  ...
                </button> */}
            </div>
          </div>

          {/* NEXUS FEE */}
          <div className="field">
            <label htmlFor="optionalTransactionFee">
              <FormattedMessage
                id="Settings.OptionalFee"
                defaultMessage="Optional transaction fee (NXS)"
              />
            </label>
            <div className="fee">
              <FormattedMessage
                id="ToolTip.OptionalFee"
                defaultMessage="Optional transaction fee to include on transactions. Higher amounts will allow transactions to be processed faster, lower may cause additional transaction processing"
              >
                {tt => (
                  <input
                    className="Txfee"
                    id="optionalTransactionFee"
                    type="number"
                    step="0.01"
                    min="0"
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
              <button
                className="feebutton"
                onClick={e => {
                  e.preventDefault();
                  this.props.OpenModal2();
                }}
              >
                Set
              </button>
            </div>
          </div>
          {/* <div className="field">
            <label htmlFor="defaultUnitAmount">Default unit amount</label>
            <select
              id="defaultUnitAmount"
              onChange={this.updateDefaultUnitAmount}
              data-tooltip="Default unit amount to display throughout the wallet"
            >
              <option value="NXS">NXS</option>
              <option value="mNXS">mNXS</option>
              <option value="uNXS">uNXS</option>
            </select>
          </div> */}
          <Modal
            center
            classNames={{ modal: 'custom-modal5' }}
            showCloseIcon={true}
            open={this.props.openThirdModal}
            onClose={e => {
              e.preventDefault();
              this.props.CloseModal3();
            }}
          >
            <ul className="langList">
              {/* ENGLISH */}
              <li className="LanguageTranslation">
                &emsp;
                <input
                  id="English"
                  name="radio-group"
                  type="radio"
                  value="en"
                  checked={this.props.settings.locale === 'en'}
                  // onClick={() => this.changeLocale('en')}

                  onChange={e => this.changeLocale(e.target.value)}
                />
                &emsp;
                <label htmlFor="English">
                  <FormattedMessage
                    id="Lang.English"
                    defaultMessage="English"
                  />
                </label>
                &emsp; &emsp; &emsp;
                <span className="langTag">
                  <img src={FlagFile.America} />
                  (English, US) &emsp;
                </span>
              </li>

              {/* RUSSIAN */}
              <li className="LanguageTranslation">
                &emsp;
                <input
                  id="Russian"
                  name="radio-group"
                  type="radio"
                  value="ru"
                  checked={this.props.settings.locale === 'ru'}
                  onChange={e => this.changeLocale(e.target.value)}
                />
                &emsp;
                <label htmlFor="Russian">
                  <FormattedMessage
                    id="Lang.Russian"
                    defaultMessage="Russian"
                  />
                </label>
                &emsp; &emsp; &emsp;
                <span className="langTag">
                  <img src={FlagFile.Russia} />
                  (Pусский) &emsp;
                </span>
              </li>

              {/* SPANISH */}
              <li className="LanguageTranslation">
                &emsp;
                <input
                  id="Spanish"
                  name="radio-group"
                  type="radio"
                  value="es"
                  checked={this.props.settings.locale === 'es'}
                  onChange={e => this.changeLocale(e.target.value)}
                />
                &emsp;
                <label htmlFor="Spanish">
                  <FormattedMessage
                    id="Lang.Spanish"
                    defaultMessage="Spanish"
                  />
                </label>
                &emsp; &emsp; &emsp;
                <span className="langTag">
                  <img src={FlagFile.Spain} />
                  (Español) &emsp;
                </span>
              </li>

              {/* KOREAN */}
              <li className="LanguageTranslation">
                &emsp;
                <input
                  id="Korean"
                  name="radio-group"
                  type="radio"
                  value="ko"
                  checked={this.props.settings.locale === 'ko'}
                  onChange={e => this.changeLocale(e.target.value)}
                />
                &emsp;
                <label htmlFor="Korean">
                  <FormattedMessage id="Lang.Korean" defaultMessage="Korean" />
                </label>
                &emsp; &emsp; &emsp;
                <span className="langTag">
                  <img src={FlagFile.Korea} />
                  (한국어) &emsp;
                </span>
              </li>

              {/* GERMAN */}
              <li className="LanguageTranslation">
                &emsp;
                <input
                  id="German"
                  name="radio-group"
                  type="radio"
                  value="de"
                  checked={this.props.settings.locale === 'de'}
                  onChange={e => this.changeLocale(e.target.value)}
                />
                &emsp;
                <label htmlFor="German">
                  <FormattedMessage id="Lang.German" defaultMessage="German" />
                </label>
                &emsp; &emsp; &emsp;
                <span className="langTag">
                  <img src={FlagFile.Germany} />
                  (Deutsch) &emsp;
                </span>
              </li>

              {/* JAPANESE */}
              <li className="LanguageTranslation">
                &emsp;
                <input
                  id="Japanese"
                  name="radio-group"
                  type="radio"
                  value="ja"
                  checked={this.props.settings.locale === 'ja'}
                  onChange={e => this.changeLocale(e.target.value)}
                />
                &emsp;
                <label htmlFor="Japanese">
                  <FormattedMessage
                    id="Lang.Japanese"
                    defaultMessage="Japanese"
                  />
                </label>
                &emsp; &emsp; &emsp;
                <span className="langTag">
                  <img src={FlagFile.Japan} />
                  (日本人) &emsp;
                </span>
              </li>

              {/* FRENCH */}
              <li className="LanguageTranslation">
                &emsp;
                <input
                  id="French"
                  name="radio-group"
                  type="radio"
                  value="fr"
                  checked={this.props.settings.locale === 'fr'}
                  onChange={e => this.changeLocale(e.target.value)}
                />
                &emsp;
                <label htmlFor="French">
                  <FormattedMessage id="Lang.French" defaultMessage="French" />
                </label>
                &emsp; &emsp; &emsp;
                <span className="langTag">
                  <img src={FlagFile.France} />
                  (Français) &emsp;
                </span>
              </li>
            </ul>
            <div className="langsetter">
              {/* <button
              type="button"
              className="feebutton"
              onClick={() => this.props.SwitchLocale()}
            >
              <FormattedMessage id="Settings.Set" defaultMesage="Set" />
            </button> */}
            </div>
          </Modal>
          <div className="field">
            <label>
              <FormattedMessage
                id="Settings.Language"
                defaultMesage="Language"
              />
            </label>
            <div className="langSet">
              <span className="flag-icon-background flag-icon-gr" />
              <button
                type="button"
                className="Languagebutton"
                // onClick={() => this.props.SwitchLocale()}
                onClick={() => this.props.OpenModal3()}
              >
                <FormattedMessage
                  id="Settings.LangButton"
                  defaultMesage="English"
                />
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="devmode">
              <FormattedMessage
                id="Settings.DeveloperMode"
                defaultMessage="Developer Mode"
              />
            </label>
            <FormattedMessage
              id="ToolTip.DevMode"
              defaultMessage="Development mode enables advanced features to aid in development. After enabling the wallet must be closed and reopened to enable those features"
            >
              {tt => (
                <input
                  id="devmode"
                  type="checkbox"
                  className="switch"
                  onChange={this.updateDeveloperMode}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div>

          {/* <div className="field">
            <label htmlFor="emailAddress">Email Address</label>
            <input
              id="emailAddress"
              type="email"
              placeholder={settingsObj.email || ""}
              data-tooltip="Email address for email reciepts."
            />
            <button
              className="button primary"
              id="noPad"
              onClick={() => this.saveEmail()}
            >
              Save
            </button>
          </div> */}
          <div>
            <button
              className="button primary"
              disabled={!this.props.connections}
              onClick={e => {
                e.preventDefault();
                this.props.OpenModal4();
              }}
            >
              <FormattedMessage
                id="Settings.BackupWallet"
                defaultMessage="Backup Wallet"
              />
            </button>
          </div>
          <div className="clear-both" />
        </form>
      </section>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsApp);
