// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global
import Text from 'components/Text';
import { updateSettings } from 'actions/settingsActionCreators';
import { switchSettingsTab } from 'actions/uiActionCreators';
import { backupWallet } from 'api/wallet';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import Switch from 'components/Switch';
import Icon from 'components/Icon';
import UIController from 'components/UIController';
import SettingsContainer from 'components/SettingsContainer';
import * as color from 'utils/color';
import * as form from 'utils/form';
import warningIcon from 'images/warning.sprite.svg';
import updater from 'updater';

// Internal Local
import LanguageSetting from './LanguageSetting';
import BackupDirSetting from './BackupDirSetting';

const WarningIcon = styled(Icon)(({ theme }) => ({
  color: color.lighten(theme.danger, 0.3),
  fontSize: '1.1em',
}));

const fiatCurrencies = [
  { value: 'AUD', display: 'Australian Dollar (AUD)' },
  { value: 'BRL', display: 'Brazilian Real (BRL)' },
  { value: 'GBP', display: 'British Pound (GBP)' },
  { value: 'CAD', display: 'Canadian Dollar (CAD)' },
  { value: 'CLP', display: 'Chilean Peso (CLP)' },
  { value: 'CNY', display: 'Chinese Yuan (CNY)' },
  { value: 'CZK', display: 'Czeck Koruna (CZK)' },
  { value: 'EUR', display: 'Euro (EUR)' },
  { value: 'HKD', display: 'Hong Kong Dollar (HKD)' },
  { value: 'ILS', display: 'Israeli Shekel (ILS)' },
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
  connections: state.core.info.connections,
  settings: state.settings,
});

const actionCreators = {
  updateSettings,
  switchSettingsTab,
};

/**
 * App Page in the Setting Page
 *
 * @class SettingsApp
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
class SettingsApp extends Component {
  /**
   *Creates an instance of SettingsApp.
   * @param {*} props
   * @memberof SettingsApp
   */
  constructor(props) {
    super(props);
    props.switchSettingsTab('App');
  }
  /**
   *  Confirm Wallet Back up
   *
   * @memberof SettingsApp
   */
  confirmBackupWallet = () => {
    UIController.openConfirmDialog({
      question: <Text id="Settings.BackupWallet" />,
      callbackYes: () => {
        if (this.props.connections !== undefined) {
          backupWallet(this.props.settings.backupDirectory);
          UIController.showNotification(
            <Text id="Alert.WalletBackedUp" />,
            'success'
          );
        } else {
          UIController.openErrorDialog({
            message: <Text id="Settings.DaemonLoading" />,
          });
        }
      },
    });
  };

  toggleVerifyModuleSource = e => {
    if (e.target.checked) {
      UIController.openConfirmDialog({
        question: 'Turn module open source policy on?',
        note:
          'All modules without open source verifications, possibly including your own under-development modules, will become invalid. Wallet must be refreshed for the change to take effect.',
        callbackYes: () => {
          this.props.updateSettings({ verifyModuleSource: true });
          location.reload();
        },
      });
    } else {
      UIController.openConfirmDialog({
        question: 'Turn module open source policy off?',
        note: (
          <div>
            <p>
              This is only for module developers and can be dangerous for
              regular users. Please make sure you know what you are doing!
            </p>
            <p>
              It would be much easier for a closed source module to hide
              malicious code than for an open source one. Therefore, in case you
              still want to disable this setting, it is highly recommended that
              you only install and run closed source modules that you are
              developing yourself.
            </p>
          </div>
        ),
        labelYes: 'Turn policy off',
        skinYes: 'danger',
        callbackYes: () => {
          this.props.updateSettings({ verifyModuleSource: false });
          location.reload();
        },
        labelNo: 'Keep policy on',
        skinNo: 'primary',
        style: { width: 600 },
      });
    }
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

  /**
   * Handles update Change
   *
   * @memberof SettingsApp
   */
  handleAutoUpdateChange = e => {
    if (!e.target.checked) {
      UIController.openConfirmDialog({
        question: <Text id="Settings.DisableAutoUpdate" />,
        note: <Text id="Settings.DisableAutoUpdateNote" />,
        labelYes: <Text id="Settings.KeepAutoUpdate" />,
        labelNo: <Text id="Settings.TurnOffAutoUpdate" />,
        skinNo: 'danger',
        callbackNo: () => {
          this.props.updateSettings({ autoUpdate: false });
          updater.stopAutoUpdate();
        },
        style: { width: 580 },
      });
    } else {
      this.props.updateSettings({ autoUpdate: true });
      if (updater.state === 'idle') {
        updater.autoUpdate();
      }
    }
  };

  /**
   * React Render
   *
   * @returns
   * @memberof SettingsApp
   */
  render() {
    const { connections, settings } = this.props;
    return (
      <SettingsContainer>
        <LanguageSetting />

        <SettingsField
          connectLabel
          label={<Text id="Settings.MinimizeClose" />}
          subLabel={<Text id="ToolTip.MinimizeOnClose" />}
        >
          <Switch
            checked={settings.minimizeOnClose}
            onChange={this.updateHandlers('minimizeOnClose')}
          />
        </SettingsField>

        <SettingsField
          connectLabel
          label={
            <span>
              <span className="v-align">
                <Text id="Settings.AutoUpdate" />{' '}
                {!settings.autoUpdate && (
                  <WarningIcon spaceLeft icon={warningIcon} />
                )}
              </span>
            </span>
          }
          subLabel={
            <div>
              <Text id="Settings.AutoUpdateNote" />
              {process.platform === 'darwin' && (
                <div className="error">
                  <Text id="Settings.AutoUpdateDisabled" />
                </div>
              )}
            </div>
          }
        >
          <Switch
            checked={settings.autoUpdate && process.platform !== 'darwin'}
            onChange={this.handleAutoUpdateChange}
            disabled={process.platform === 'darwin'}
          />
        </SettingsField>

        <SettingsField
          connectLabel
          label={<Text id="Settings.UsageData" />}
          subLabel={<Text id="ToolTip.Usage" />}
        >
          <Switch
            checked={settings.sendUsageData}
            onChange={this.updateHandlers('sendUsageData')}
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
            value={settings.minConfirmations}
            step="1"
            min="1"
            onChange={this.updateHandlers('minConfirmations')}
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

        <div style={{ display: settings.devMode ? 'block' : 'none' }}>
          <SettingsField
            indent={1}
            connectLabel
            label={<Text id="Settings.EnforceOpenSourceModules" />}
            subLabel={<Text id="Settings.EnforceOpenSourceModulesNote" />}
          >
            <Switch
              checked={settings.verifyModuleSource}
              onChange={this.toggleVerifyModuleSource}
            />
          </SettingsField>
        </div>

        <Button
          disabled={connections === undefined}
          style={{ marginTop: '2em' }}
          onClick={this.confirmBackupWallet}
        >
          <Text id="Settings.BackupWallet" />
        </Button>
      </SettingsContainer>
    );
  }
}
export default SettingsApp;
