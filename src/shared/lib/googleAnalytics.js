////////////////////////
// Google Analytics
////////////////////////
// Script that holds on to a visitor and is referenced when a visitor makes a action
import ua from 'universal-analytics';
import settings from 'data/initialSettings';
import os from 'os';

const GA = {};

GA.visitor = null;
GA.active = false;

if (
  (settings.sendUsageData == null ||
    settings.sendUsageData == undefined ||
    Boolean(settings.sendUsageData) == true) &&
  process.env.NODE_ENV !== 'development'
) {
  GA.visitor = ua('UA-207070578-1');
  GA.active = true;
  GA.visitor.set('ul', settings.locale || 'en');
  GA.visitor.set('aiid', process.platform);
  GA.visitor.set('ds', 'app');
  GA.visitor.set('aip', 1);
  try {
    const osVer = os.platform() + ' ' + os.release();
    GA.visitor.set('cd1', osVer);
    GA.visitor.set('cd2', os.cpus()[0].model);
  } catch (e) {
    console.error(e);
  }
}

// Send Screen
// Send A Screen Event to Google, this is like a url hit for websites
// Input :
//     ScreenTitle || String || The Screen To Post
GA.SendScreen = function (ScreenTitle) {
  if (GA.active == false) return;

  GA.visitor.screenview(ScreenTitle, 'Nexus Wallet', APP_VERSION).send();
};

// Send Event
// Send A regular event to google
// Input :
//     category || String || Event Category, grand scheme
//     action   || String || Event Action, group of events
//     label    || String || Event Label, The actual event being fired
//     value    || NonNegative Int || Event Value, must be NonNegative

GA.SendEvent = function (category, action, lable, value) {
  if (GA.active == false) return;
  GA.visitor.event(category, action, lable, value).send();
};

// Disable Analytics
// Turn off anayltics and destroys the old object
GA.DisableAnalytics = function () {
  if (GA.visitor == null) return;
  GA.visitor = null;
  GA.active = false;
};

// Enable Analytics
// Turn on Analytics and create a new visitor
GA.EnableAnalytics = function () {
  if (GA.visitor != null) return;
  GA.visitor = ua('UA-207070578-1');
  GA.active = true;
  GA.visitor.set('ul', settings.locale || 'en');
  GA.visitor.set('aiid', process.platform);
  GA.visitor.set('ds', 'app');
  GA.visitor.set('aip', 1);
  try {
    const osVer = os.platform() + ' ' + os.release();
    GA.visitor.set('cd1', osVer);
    GA.visitor.set('cd2', os.cpus()[0].model);
  } catch (e) {
    console.error(e);
  }
};

export default GA;
