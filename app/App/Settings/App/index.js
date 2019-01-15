// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global
import Text from 'components/Text';
import { updateSettings } from 'actions/settingsActionCreators';
import { backupWallet } from 'api/wallet';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import Switch from 'components/Switch';
import UIController from 'components/UIController';
import { form } from 'utils';

// Internal Local
import LanguageSetting from './LanguageSetting';
import BackupDirSetting from './BackupDirSetting';

const AppSettings = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

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
  confirmBackupWallet = () => {
    UIController.openConfirmDialog({
      question: <Text id="Settings.BackupWallet" />,
      yesCallback: () => {
        if (this.props.connections !== undefined) {
          backupWallet(this.props.settings.Folder);
          UIController.showNotification(
            <Text id="Alert.WalletBackedUp" />,
            'success'
          );
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
        <LanguageSetting />

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

        <BackupDirSetting />

        <SettingsField
          connectLabel
          label={<Text id="Settings.DeveloperMode" />}
          subLabel={<Text id="ToolTip.DevMode" />}
        >
          <Switch
            checked={settings.devMode}
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
