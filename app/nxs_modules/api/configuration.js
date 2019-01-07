//////////////////////////////////////////////////////
//
// Configuration Manager
//
//////////////////////////////////////////////////////

// External
import fs from 'fs';
import path from 'path';
import electron from 'electron';

const configuration = {
  //
  // Exists: Check if a configuration file exists
  //

  Exists(filename) {
    try {
      fs.accessSync(path.join(configuration.GetAppDataDirectory(), filename));
      return true;
    } catch (err) {
      return false;
    }
  },

  //
  // Read: Read a configuration file
  //

  Read(filename) {
    try {
      return fs.readFileSync(
        path.join(configuration.GetAppDataDirectory(), filename)
      );
    } catch (err) {
      console.log('Error reading file: ' + filename + ' => ' + err);

      return undefined;
    }
  },

  //
  // ReadJson: Read a json configuration file and return a json object
  //

  ReadJson(filename) {
    //
    // TODO: Is utf-8 required here?
    //

    var json = configuration.Read(filename);
    if (!json) return {};
    return JSON.parse(json);
  },

  //
  // Write: Update a configuration file with provided content
  //

  Write(filename, content) {
    //  if (!configuration.Exists("settings.json")) {
    //    console.log("Creating settings.json in " + configuration.GetAppDataDirectory());
    //    fs.closeSync(fs.openSync(path.join(configuration.GetAppDataDirectory(), "settings.json"), 'w'));
    //    fs.writeFileSync(path.join(configuration.GetAppDataDirectory(), "settings.json"), '{}');
    //  }
    try {
      fs.writeFileSync(
        path.join(configuration.GetAppDataDirectory(), filename),
        content
      );

      return true;
    } catch (err) {
      console.log('Error writing file: ' + filename + ' => ' + err);

      return false;
    }
  },

  //
  // WriteJson: Update a json configuration file with provided json object
  //

  WriteJson(filename, json) {
    //
    // TODO: Is utf-8 required here?
    //

    return configuration.Write(filename, JSON.stringify(json, null, 2)); // pretty print the json so it is human readable
  },

  //
  // Delete: Delete the configuration file
  //

  Delete(filename) {
    try {
      fs.unlink(path.join(configuration.GetAppDataDirectory(), filename));

      return true;
    } catch (err) {
      console.log('Error deleting file: ' + filename + ' => ' + err);

      return false;
    }
  },

  //
  // Rename: Rename a configuration file
  //

  Rename(oldFilename, newFilename) {
    try {
      fs.renameSync(
        path.join(configuration.GetAppDataDirectory(), oldFilename),
        path.join(configuration.GetAppDataDirectory(), newFilename)
      );

      return true;
    } catch (err) {
      console.log('Error renaming file: ' + filename + ' => ' + err);

      return false;
    }
  },

  Start() {
    if (!fs.existsSync(configuration.GetAppDataDirectory())) {
      fs.mkdirSync(configuration.GetAppDataDirectory());
    }

    if (!fs.existsSync(configuration.GetAppResourceDir())) {
      fs.mkdirSync(configuration.GetAppResourceDir());
    }
  },

  //
  // GetAppDataDirectory: Get the application data directory
  //

  GetAppDataDirectory() {
    const app = electron.app || electron.remote.app;
    let AppDataDirPath = '';

    if (process.platform === 'darwin') {
      AppDataDirPath = path.join(
        app
          .getPath('appData')
          .replace(' ', `\ `)
          .replace('/Electron/', ''),
        'Nexus_Wallet_BETA_v0.8.4'
      );
    } else {
      AppDataDirPath = path.join(
        app.getPath('appData').replace('/Electron/', ''),
        'Nexus_Wallet_BETA_v0.8.4'
      );
    }

    return AppDataDirPath;
  },

  GetCoreDataDir() {
    var datadir = '';

    //Set data directory by OS for automatic daemon mode
    if (process.platform === 'win32') {
      var datadir = process.env.APPDATA + '\\Nexus_Core_Data_BETA_v0.8.4';
    } else if (process.platform === 'darwin') {
      var datadir = process.env.HOME + '/.Nexus_Core_Data_BETA_v0.8.4';
    } else {
      var datadir = process.env.HOME + '/.Nexus_Core_Data_BETA_v0.8.4';
    }
    return datadir;
  },

  GetAppResourceDir() {
    const app = electron.app != undefined ? electron.app : electron.remote.app;
    let rawPath = '';
    if (process.platform === 'darwin') {
      rawPath = path.dirname(app.getPath('exe')) + '/../Resources/app/';
    } else {
      rawPath = path.dirname(app.getPath('exe')) + '/resources/app/';
    }
    if (process.env.NODE_ENV_RUN == 'production-test') {
      rawPath = path.join(rawPath, '..', '..', '..', '..', '..', 'app');
    }
    if (process.platform == 'win32') {
      return path.win32.normalize(rawPath);
    } else {
      return path.normalize(rawPath);
    }
  },
};

configuration.Start();

export default configuration;
