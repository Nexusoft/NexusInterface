//////////////////////////////////////////////////////
//
// Settings Manager
//
//////////////////////////////////////////////////////

import config from 'api/configuration';

//
// GetSettings: Get the application settings.json file from disk and return it
//
export function GetSettings() {
  return config.ReadJson('settings.json');
}

//
// SaveSettings: Save the application settings.json file
//

export function SaveSettings(settingsJson) {
  return config.WriteJson('settings.json', settingsJson);
}
