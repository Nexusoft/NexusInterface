////////////////////////////////////////////////////////////////////////////////
//
// Settings Manager
//
////////////////////////////////////////////////////////////////////////////////

var settings = exports;

var config = require("./configuration.js");

//
// GetSettings: Get the application settings.json file from disk and return it
//

settings.GetSettings = function ()
{
    return config.ReadJson("settings.json");
}

//
// SaveSettings: Save the application settings.json file
//

settings.SaveSettings = function (settingsJson)
{
    return config.WriteJson("settings.json", settingsJson);
}