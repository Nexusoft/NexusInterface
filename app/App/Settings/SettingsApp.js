// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { remote } from 'electron';
import { reduxForm, Field } from 'redux-form';

// Internal Global Dependencies
import Text from 'components/Text';
import * as RPC from 'scripts/rpc';
import * as FlagFile from 'images/LanguageFlags';
import { updateSettings } from 'actions/settingsActionCreators';
import { backupWallet } from 'api/wallet';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import Switch from 'components/Switch';
import UIController from 'components/UIController';
import { form } from 'utils';

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
        <span className="v-align">日本語</span>
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
  { value: 'AUD', display: 'Australian Dollar (AUD)' },
  { value: 'BRL', display: 'Brazilian Real (BRL)' },
  { value: 'GPB', display: 'British Pound (GBP)' },
  { value: 'CAD', display: 'Canadian Dollar (CAD)' },
  { value: 'CLP', display: 'Chilean Peso (CLP)' },
  { value: 'CNY', display: 'Chinese Yuan (CNY)' },
  { value: 'CZK', display: 'Czeck Koruna (CZK)' },
  { value: 'EUR', display: 'Euro (EUR)' },
  { value: 'HKD', display: 'Hong Kong Dollar (HKD)' },
  { value: 'INR', display: 'Israeli Shekel (INR)' },
  { value: 'JPY', display: 'Japanese Yen (JPY)' },
  { value: 'KRW', display: 'Korean Won (KRW)' },
  { value: 'MYR', display: 'Malaysian Ringgit (MYR)' },
  { value: 'MXN', display: 'Mexican Peso (MXN)' },
  { value: 'NZD', display: 'New Zealand Dollar (NZD)' },
  { value: 'PKR', display: 'Pakistan Rupee (PKR)' },
  { value: 'RUB', display: 'Russian Ruble (RUB)' },
  { value: 'SAR', display: 'Saudi Riyal (SAR)' },
  { value: 'SGD', display: 'Singapore Dollar (SGD)' },
  { value: 'ZAR', display: 'South African Rand (ZAR)' },
  { value: 'CHF', display: 'Swiss Franc (CHF)' },
  { value: 'TWD', display: 'Taiwan Dollar (TWD)' },
  { value: 'AED', display: 'United Arab Emirates Dirham (AED)' },
  { value: 'USD', display: 'United States Dollar (USD)' },
];

@connect(state => ({
  initialValues: {
    txFee: state.overview.paytxfee,
  },
}))
@reduxForm({
  form: 'setTransactionFee',
  validate: ({ txFee }) => {
    const errors = {};
    if (parseFloat(txFee) > 0) {
      errors.txFee = <Text id="Alert.InvalidTransactionFee" />;
    }
    return errors;
  },
  onSubmit: ({ txFee }) => RPC.PROMISE('settxfee', [parseFloat(txFee)]),
  onSubmitSuccess: () => {
    UIController.showNotification(
      <Text id="Alert.TransactionFeeSet" />,
      'success'
    );
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    if (!errors || !Object.keys(errors).length) {
      UIController.openErrorDialog({
        message: 'Error setting Transaction Fee',
        note: submitError || 'An unknown error occurred',
      });
    }
  },
})
class FeeSetting extends React.Component {
  confirmSetTxFee = () => {
    UIController.openConfirmDialog({
      question: <Text id="Settings.SetFee" />,
      yesCallback: this.props.handleSubmit,
    });
  };

  render() {
    const { submitting } = this.props;
    return (
      <SettingsField
        connectLabel
        label={<Text id="Settings.OptionalFee" />}
        subLabel={<Text id="ToolTip.OptionalFee" />}
      >
        {inputId => (
          <div className="flex stretch">
            <Field
              component={TextField.RF}
              name="txFee"
              type="number"
              step="0.01"
              min="0"
              style={{ width: 100 }}
            />
            <Button
              disable={submitting}
              fitHeight
              onClick={this.confirmSetTxFee}
              style={{ marginLeft: '1em' }}
            >
              Set
            </Button>
          </div>
        )}
      </SettingsField>
    );
  }
}

const mapStateToProps = state => ({
  connections: state.overview.connections,
  settings: state.settings.settings,
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
        defaultPath: this.props.settings.Folder,
        properties: ['openDirectory'],
      },
      folderPaths => {
        if (folderPaths && folderPaths.length > 0) {
          this.props.updateSettings({ Folder: folderPaths[0] });
        }
      }
    );
  };

  confirmBackupWallet = () => {
    UIController.openConfirmDialog({
      question: <Text id="Settings.BackupWallet" />,
      yesCallback: () => {
        if (this.props.connections !== undefined) {
          backupWallet(this.props.settings.Folder);
        } else {
          UIController.openErrorDialog({
            message: 'Please wait for Daemon to load',
          });
        }
      },
    });
  };

  updateHandlers = (() => {
    const handlers = [];
    return settingName => {
      if (!handlers[settingName]) {
        handlers[settingName] = input =>
          this.props.updateSettings({
            [settingName]: form.resolveValue(input),
          });
      }
      return handlers[settingName];
    };
  })();

  render() {
    const { connections, settings } = this.props;
    return (
      <AppSettings>
        <SettingsField label={<Text id="Settings.Language" />}>
          <Select
            options={languages}
            value={settings.locale}
            onChange={this.updateHandlers('locale')}
          />
        </SettingsField>

        <SettingsField
          connectLabel
          label={<Text id="Settings.MinimizeClose" />}
          subLabel={<Text id="ToolTip.MinimizeOnClose" />}
        >
          <Switch
            checked={settings.minimizeToTray}
            onChange={this.updateHandlers('minimizeToTray')}
          />
        </SettingsField>

        <SettingsField
          connectLabel
          label={<Text id="Settings.UsageData" />}
          subLabel={<Text id="ToolTip.Usage" />}
        >
          <Switch
            checked={settings.googleAnalytics}
            onChange={this.updateHandlers('googleAnalytics')}
          />
        </SettingsField>

        <SettingsField label={<Text id="Settings.Fiat" />}>
          <Select
            value={settings.fiatCurrency}
            onChange={this.updateHandlers('fiatCurrency')}
            options={fiatCurrencies}
            style={{ maxWidth: 260 }}
          />
        </SettingsField>

        <SettingsField
          connectLabel
          label={<Text id="Settings.MinimumConfirmations" />}
          subLabel={<Text id="ToolTip.MinimumConfirmations" />}
        >
          <TextField
            type="number"
            value={settings.minimumconfirmations}
            step="1"
            min="1"
            onChange={this.updateHandlers('minimumconfirmations')}
            onKeyPress={e => {
              e.preventDefault();
            }}
            style={{ width: 75 }}
          />
        </SettingsField>

        <SettingsField connectLabel label={<Text id="Settings.Folder" />}>
          {inputId => (
            <div className="flex stretch">
              <TextField
                id={inputId}
                value={settings.Folder}
                onChange={this.updateHandlers('Folder')}
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

        {/* Need to wait for the daemon info to initialize txFee value */}
        {connections !== undefined && <FeeSetting />}

        <SettingsField
          connectLabel
          label={<Text id="Settings.DeveloperMode" />}
          subLabel={<Text id="ToolTip.DevMode" />}
        >
          <Switch
            checked={settings.devmode}
            onChange={this.updateHandlers('devMode')}
          />
        </SettingsField>

        <Button
          disabled={connections === undefined}
          style={{ marginTop: '2em' }}
          onClick={this.confirmBackupWallet}
        >
          <Text id="Settings.BackupWallet" />
        </Button>
      </AppSettings>
    );
  }
}
