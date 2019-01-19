////////////////////////
// Google Analytics
////////////////////////
// Script that holds on to a visitor and is referenced when a visitor makes a action
var GA = {};

let ua = require('universal-analytics');
GA.visitor = null;
GA.active = false;
let settings = require('api/settings').GetSettings();
if (
  settings.googleAnalytics == null ||
  settings.googleAnalytics == undefined ||
  Boolean(settings.googleAnalytics) == true
) {
  GA.visitor = ua('UA-117808839-1');
  GA.active = true;
}

// Send Screen
// Send A Screen Event to Google, this is like a url hit for websites
// Input :
//     ScreenTitle || String || The Screen To Post
GA.SendScreen = function(ScreenTitle) {
  if (GA.active == false) return;

  GA.visitor.screenview(ScreenTitle, 'Nexus Wallet', '0.8.6').send();
  console.log('Sent Screen: ' + ScreenTitle);
};

// Send Event
// Send A regular event to google
// Input :
//     category || String || Event Category, grand scheme
//     action   || String || Event Action, group of events
//     label    || String || Event Label, The actual event being fired
//     value    || NonNegative Int || Event Value, must be NonNegative

GA.SendEvent = function(category, action, lable, value) {
  if (GA.active == false) return;
  GA.visitor.event(category, action, lable, value).send();
};

// Disable Analytics
// Turn off anayltics and destroys the old object
GA.DisableAnalytics = function() {
  if (GA.visitor == null) return;
  GA.visitor = null;
  GA.active = false;
};

// Enable Analytics
// Turn on Analytics and create a new visitor
GA.EnableAnalytics = function() {
  if (GA.visitor != null) return;
  GA.visitor = ua('UA-117808839-1');
  GA.active = true;
};

module.exports = GA;

// When this code is started up for the first time try and run a event to get the visitor in the system.
GA.SendScreen('Overview');
