'use strict';

function assertCoreConsoleAllowed(settings) {
  if (!settings || settings.devMode !== true) {
    throw new Error(
      'Core console access requires Developer mode to be enabled in Settings'
    );
  }
}

module.exports = {
  assertCoreConsoleAllowed,
};
