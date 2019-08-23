// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global
import { updateSettings } from 'actions/settings';
import { switchSettingsTab } from 'actions/ui';
import { backupWallet } from 'lib/wallet';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import Switch from 'components/Switch';
import Icon from 'components/Icon';
import {
  openConfirmDialog,
  openErrorDialog,
  showNotification,
} from 'actions/overlays';
import * as color from 'utils/color';
import * as form from 'utils/form';
import { isCoreConnected } from 'selectors';
import warningIcon from 'images/warning.sprite.svg';
import { startAutoUpdate, stopAutoUpdate } from 'lib/updater';

// Internal Local
import LanguageSetting from './LanguageSetting';
import BackupDirSetting from './BackupDirSetting';

const WarningIcon = styled(Icon)(({ theme }) => ({
  color: color.lighten(theme.danger, 0.3),
  fontSize: '1.1em',
}));

const fiatCurrencies = [
  { value: 'AUD', display: 'Australian Dollar (AUD)' },
  { value: 'BTC', display: 'Bitcoin (BTC)' },
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
  coreConnected: isCoreConnected(state),
  settings: state.settings,
});

const actionCreators = {
  updateSettings,
  switchSettingsTab,
  openConfirmDialog,
  openErrorDialog,
  showNotification,
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
   * Creates an instance of SettingsApp.
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
    this.props.openConfirmDialog({
      question: __('Backup wallet'),
      callbackYes: () => {
        if (this.props.coreConnected) {
          backupWallet(this.props.settings.backupDirectory);
          this.props.showNotification(
            __('Wallet has been backed up'),
            'success'
          );
        } else {
          this.props.openErrorDialog({
            message: __('Connecting to Nexus Core'),
          });
        }
      },
    });
  };

  /**
   * Toggles if modules should be verified or not.
   *
   * @memberof SettingsApp
   */
  toggleVerifyModuleSource = e => {
    if (e.target.checked) {
      this.props.openConfirmDialog({
        question: __('Turn module open source policy on?'),
        note: __(
          'All modules without open source verifications, possibly including your own under-development modules, will become invalid. Wallet must be refreshed for the change to take effect.'
        ),
        callbackYes: () => {
          this.props.updateSettings({ verifyModuleSource: true });
          location.reload();
        },
      });
    } else {
      this.props.openConfirmDialog({
        question: __('Turn module open source policy off?'),
        note: (
          <div>
            <p>
              {__(`This is only for module developers and can be dangerous for
              regular users. Please make sure you know what you are doing!`)}
            </p>
            <p>
              {__(`It would be much easier for a closed source module to hide
              malicious code than for an open source one. Therefore, in case you
              still want to disable this setting, it is highly recommended that
              you only install and run closed source modules that you are
              developing yourself.`)}
            </p>
          </div>
        ),
        labelYes: __('Turn policy off'),
        skinYes: 'danger',
        callbackYes: () => {
          this.props.updateSettings({ verifyModuleSource: false });
          location.reload();
        },
        labelNo: __('Keep policy on'),
        skinNo: 'primary',
        style: { width: 600 },
      });
    }
  };

  /**
   * Update the settings
   *
   * @memberof SettingsApp
   */
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
      this.props.openConfirmDialog({
        question: __('Are you sure you want to disable auto update?'),
        note: __(
          'Keeping your wallet up-to-date is important for your security and will ensure that you get the best possible user experience.'
        ),
        labelYes: __('Keep auto update On'),
        labelNo: __('Turn auto update Off'),
        skinNo: 'danger',
        callbackNo: () => {
          this.props.updateSettings({ autoUpdate: false });
          stopAutoUpdate();
        },
        style: { width: 580 },
      });
    } else {
      this.props.updateSettings({ autoUpdate: true });
      startAutoUpdate();
    }
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsApp
   */
  render() {
    const { coreConnected, settings } = this.props;
    return (
      <>
        <LanguageSetting />

        <SettingsField
          connectLabel
          label={__('Minimize on close')}
          subLabel={__(
            'Minimize the wallet when closing the window instead of closing it.'
          )}
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
                {__('Auto update (Recommended)')}{' '}
                {!settings.autoUpdate && (
                  <WarningIcon spaceLeft icon={warningIcon} />
                )}
              </span>
            </span>
          }
          subLabel={
            <div>
              {__(
                'Automatically check for new versions and notify if a new version is available.'
              )}
              {process.platform === 'darwin' && (
                <div className="error">
                  {__(
                    'Auto Update is not yet available on Mac, please update the wallet manually for the time being'
                  )}
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
          label={__('Send anonymous usage data')}
          subLabel={__(
            'Send anonymous usage data to allow the Nexus developers to improve the wallet.'
          )}
        >
          <Switch
            checked={settings.sendUsageData}
            onChange={this.updateHandlers('sendUsageData')}
          />
        </SettingsField>

        <SettingsField label={__('Base currency')}>
          <Select
            value={settings.fiatCurrency}
            onChange={this.updateHandlers('fiatCurrency')}
            options={fiatCurrencies}
            style={{ maxWidth: 260 }}
          />
        </SettingsField>

        <SettingsField
          connectLabel
          label={__('Minimum confirmations')}
          subLabel={__(
            'Minimum amount of confirmations before a block is accepted. Local only.'
          )}
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
          label={__('Developer mode')}
          subLabel={__(
            'Development mode enables advanced features to aid in development. After enabling the wallet must be closed and reopened to enable those features.'
          )}
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
            label={__('Module open source policy')}
            subLabel={__(
              "Only modules which have valid open source repositories are allowed to be installed and run. You can disable this option to test run the modules that you're developing"
            )}
          >
            <Switch
              checked={settings.verifyModuleSource}
              onChange={this.toggleVerifyModuleSource}
            />
          </SettingsField>
          <SettingsField
            indent={1}
            connectLabel
            label={__('Fake Test Transactions')}
            subLabel={__('Display Test Transactions on the Transactions page')}
          >
            <Switch
              checked={settings.fakeTransactions}
              onChange={this.updateHandlers('fakeTransactions')}
            />
          </SettingsField>
        </div>

        <Button
          disabled={!coreConnected}
          style={{ marginTop: '2em' }}
          onClick={this.confirmBackupWallet}
        >
          {__('Backup wallet')}
        </Button>
      </>
    );
  }
}
export default SettingsApp;
