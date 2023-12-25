////////////////////////
// Google Analytics
////////////////////////
// Script that holds on to a visitor and is referenced when a visitor makes a action

import os from 'os';
import { ipcRenderer } from 'electron';
import store from 'store';

const GA = {};

GA.visitor = null;
GA.active = false;

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

// Send Screen
// Send A Screen Event to Google, this is like a url hit for websites
// Input :
//     ScreenTitle || String || The Screen To Post
GA.SendScreen = function (screenTitle) {
  if (!GA.active) return;
  const params = {
    engagement_time_msec: 1000,
    page_title: screenTitle,
    screen_name: screenTitle,
  };
  ipcRenderer.invoke('send-GA4-event', {
    eventName: 'screen_view',
    eventParams: params,
    userAgent: getUserAgent(),
  });
};

GA.LogIn = function () {
  if (!GA.active) return;
  const params = {
    engagement_time_msec: 500,
  };
  ipcRenderer.invoke('send-GA4-event', {
    eventName: 'login',
    eventParams: params,
    userAgent: getUserAgent(),
  });
};

GA.LogOut = function () {
  if (!GA.active) return;
  const params = {
    engagement_time_msec: 500,
  };
  ipcRenderer.invoke('send-GA4-event', {
    eventName: 'logout',
    eventParams: params,
    userAgent: getUserAgent(),
  });
};

GA.InstallModule = function (moduleName) {
  if (!GA.active) return;
  const params = {
    engagement_time_msec: 500,
    module: moduleName,
  };
  ipcRenderer.invoke('send-GA4-event', {
    eventName: 'install_module',
    eventParams: params,
    userAgent: getUserAgent(),
  });
};

GA.UninstallModule = function (moduleName) {
  if (!GA.active) return;
  const params = {
    engagement_time_msec: 500,
    module: moduleName,
  };
  ipcRenderer.invoke('send-GA4-event', {
    eventName: 'uninstall_module',
    eventParams: params,
    userAgent: getUserAgent(),
  });
};

// Send Event
// Send A regular event to google
// Input :
//     category || String || Event Category, grand scheme
//     action   || String || Event Action, group of events
//     label    || String || Event Label, The actual event being fired
//     value    || NonNegative Int || Event Value, must be NonNegative

GA.SendEvent = function (category, action, lable, value) {
  //GA.visitor.event(category, action, lable, value).send();
};

// Disable Analytics
// Turn off anayltics and destroys the old object
GA.DisableAnalytics = function () {
  GA.active = false;
  ipcRenderer.invoke('remove-GA4', ScreenTitle);
  //document.getElementById('gtag-loader').remove();
  //document.getElementById('gtag-init').remove();
};

// Enable Analytics
// Turn on Analytics and create a new visitor
GA.EnableAnalytics = function () {
  GA.active = true;
  //addGTag();
};

GA.addGTag = function () {
  //Currenlty doesnt support production but I might use this block of code later.
  return;
  /*
  const osVer = os.platform() + ' ' + os.release();
  var gtagLoader = document.createElement('script');
  gtagLoader.setAttribute('id', 'gtag-loader');
  gtagLoader.async = true;
  gtagLoader.src = 'https://www.googletagmanager.com/gtag/js?id=G-5CX0RT2KGY';
  gtagLoader.id = 'gtag-loader';
  gtagLoader.onload = () => {
    var gtagInit = document.createElement('script');
    gtagInit.id = 'gtag-init';
    gtagInit.innerHTML = `  window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
  
    gtag('config', 'G-5CX0RT2KGY',{'app_version': '${APP_VERSION}', 'os_version': '${osVer}', 'cpu_version' : '${
      os.cpus()[0].model
    }' } );`;

    document.documentElement.insertBefore(gtagInit, document.body);
  };
  document.documentElement.insertBefore(gtagLoader, document.body);
  */
};

export default GA;
