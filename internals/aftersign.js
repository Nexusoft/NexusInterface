const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  //If no identity then reject trying to notarize
  const macSignIdentity = context.packager.info._configuration.mac.identity;
  if (macSignIdentity === null) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.nexusearth.NexusTritium',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: 'xxxxxxxxxxx',
    appleIdPassword: 'xxxxxxxxxxx',
  });
};
