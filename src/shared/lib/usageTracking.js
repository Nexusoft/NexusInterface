////////////////////////
// Usage Tracker
////////////////////////
// Script that holds on to a visitor and is referenced when a visitor makes a action

import store from 'store';
import { trackEvent } from '@aptabase/electron/renderer';
import { ipcRenderer } from 'electron';

const UT = {};

UT.active = false;

const getUserAgent = function () {
  const { settings } = store.getState();
  const userAgentPayload = {
    cd_currency: {
      value: settings.fiatCurrency,
    },
    app_version: {
      value: APP_VERSION.toString(),
    },
    cd_language: {
      value: settings.locale,
    },
    cd_overview_display_style: {
      value: settings.overviewDisplay,
    },
  };

  return userAgentPayload;
};

UT.SendScreen = function (screenTitle) {
  return; // right now lets not push too many events
  if (!UT.active) return;
  const params = {
    screen_name: screenTitle,
  };
  trackEvent('screen_view', params);
};

UT.LogIn = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('login');
};

UT.LogOut = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('logout');
};

UT.CreateUserAccount = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('create_user');
};

UT.RecoveredUserAccount = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('recovered_user');
};

UT.RecoverPhrase = function (hadRecoverPhrase) {
  if (!UT.active) return;
  const params = {
    new: hadRecoverPhrase,
  };
  trackEvent('set_recovery', params);
};

UT.UpdateCredentials = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('update_credentials');
};

UT.Send = function (tokenType) {
  if (!UT.active) return;
  const params = {
    type: tokenType,
  };
  trackEvent('send', params);
};

UT.InstallModule = function (moduleName) {
  if (!UT.active) return;
  const params = {
    module: moduleName,
  };
  trackEvent('install_module', params);
};

UT.UninstallModule = function (moduleName) {
  if (!UT.active) return;
  const params = {
    module: moduleName,
  };
  trackEvent('uninstall_module', params);
};

UT.StartStake = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('start_stake');
};

UT.StopStake = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('stop_stake');
};

UT.AdjustStake = function (direction) {
  if (!UT.active) return;
  const params = {};
  trackEvent('adjust_stake', direction);
};

UT.AddAddressBookEntry = function (isEdit) {
  if (!UT.active) return;
  const params = {};
  trackEvent('address_contact', isEdit ? 'edited' : 'added');
};

UT.CreateNewItem = function (itemType) {
  if (!UT.active) return;
  const params = {};
  trackEvent('create_new', itemType);
};

UT.ExportAddressBook = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('export_addressbook');
};

UT.RenameAccount = function () {
  if (!UT.active) return;
  const params = {};
  trackEvent('rename_account');
};

UT.Exception = function (error) {
  if (!UT.active) return;
  try {
    const messageSplit = error.split(':'); // Split type : message
    const typeSplit = messageSplit[0].split(' '); // split type message
    const errorType = typeSplit[typeSplit.length - 1]; // Last word is the type
    const params = {
      type: errorType,
      message: messageSplit[1],
    };
    trackEvent('error_exception', params);
  } catch (error) {
    // If this fails just move on.
  }
};

// Send Event
// Send A regular event to google
// Input :
//     category || String || Event Category, grand scheme
//     action   || String || Event Action, group of events
//     label    || String || Event Label, The actual event being fired
//     value    || NonNegative Int || Event Value, must be NonNegative

UT.SendEvent = function (category, action, lable, value) {
  //GA.visitor.event(category, action, lable, value).send();
};

// Disable Analytics
// Turn off anayltics and destroys the old object
UT.DisableAnalytics = function () {
  UT.active = false;
};

// Enable Analytics
// Turn on Analytics and create a new visitor
UT.EnableAnalytics = function () {
  UT.StartAnalytics();
};

UT.StartAnalytics = function () {
  UT.active = true;
  ipcRenderer.on('usage-tracking-error-relay', (event, message) => {
    UT.Exception(message);
  });
  trackEvent('app_started');
};

export default UT;
