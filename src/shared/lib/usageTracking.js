////////////////////////
// Usage Tracker
////////////////////////
// Script that holds on to a visitor and is referenced when a visitor makes a action

import store from 'store';
import { trackEvent } from '@aptabase/electron/renderer';

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

UT.AdjustStake = function (direction) {
  if (!UT.active) return;
  const params = {};
  trackEvent('adjust_stake', direction);
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
  UT.active = true;
};

UT.StartAnalytics = function () {
  UT.active = true;
  trackEvent('app_started');
};

export default UT;
