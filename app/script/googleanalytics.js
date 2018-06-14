// when packaging it looks like babel isn't running to make this ES6 import work, changing to require for now
// import Analytics from 'electron-google-analytics';
const Analytics  = require('electron-google-analytics');

var GANALYTICS = GANALYTICS || {};
GANALYTICS.settings = GANALYTICS.settings || require("../script/settings.js").GetSettings();

GANALYTICS.IsEnabled = GANALYTICS.IsEnabled || true; // if user deactivates analytics

GANALYTICS.CLIENTID = GANALYTICS.CLIENTID || "test";

console.log(GANALYTICS.settings.googleAnalytics);
if (GANALYTICS.settings.googleAnalytics === "false")
{
    GANALYTICS.IsEnabled = false;
}

if (GANALYTICS.IsEnabled == true){ //if not enabled don't even make the event. 
    /* const Analytics  = require('electron-google-analytics');
    const analytics = new Analytics.default('UA-117808839-1',[]); // TODO: Using a test UA id for this, should be switch to one the whole team can see
    */
   GANALYTICS.analytics = new Analytics.default('UA-117808839-1');
    GANALYTICS.CLIENTID = makeid();
} 

console.log(GANALYTICS.IsEnabled);

const accountname = 'NexusWalletTest'; //acount name for google analytics. 
const versionnumber = '0.0.1'; //app version
const appaddress = 'com.app.test'; // the ID for the app. can be anything
const appinstalleraddress = 'com.app.installer'; // not 100% on what this is, I assume apple/android?

module.exports = {
    GANALYTICS
}


//For an app instead of sending what url they are on, send what screen they are on. 
GANALYTICS.SendScreen = function (screenname)
{
    
    if (GANALYTICS.IsEnabled == false) return; // if not enabled don't do anything

    GANALYTICS.analytics.screen(accountname, versionnumber, appaddress, appinstalleraddress, screenname,"test");
}

/*
category = category to group these events in
actionname = name of the action, et "Play"
actionlable = lable
actionvalue = value (int)
*/

GANALYTICS.SendEvent = function(category, actionname,actionlable,actionvalue)
{
    GANALYTICS.analytics.event(category,actionname, { evLabel: actionlable, evValue: actionvalue});
}

GANALYTICS.SetEnabled = function(boolIsEnabled){
    if ( boolIsEnabled == "false")
    {
        GANALYTICS.IsEnabled = false;
        GANALYTICS.analytics = null;
        GANALYTICS.CLIENTID = "";

    }
    if ( boolIsEnabled == "true")
    {
        GANALYTICS.IsEnabled = true;
        GANALYTICS.analytics = new Analytics.default('UA-117808839-1');
        GANALYTICS.CLIENTID = makeid();
    }

    console.log(boolIsEnabled)

}

//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 30; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
      console.log(text);
    return text;
  }