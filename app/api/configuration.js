//////////////////////////////////////////////////////
//
// Configuration Manager
//
//////////////////////////////////////////////////////

var configuration = exports;

//
// Exists: Check if a configuration file exists
//

configuration.Exists = function(filename) {
  var fs = require("fs");
  const path = require("path");
  try {
    fs.accessSync(path.join(this.GetAppDataDirectory(), filename));

    return true;
  } catch (err) {
    return false;
  }
};

//
// Read: Read a configuration file
//

configuration.Read = function(filename) {
  var fs = require("fs");
  const path = require("path");
  try {
    // console.log(this.GetAppDataDirectory() + filename);
    return fs.readFileSync(path.join(this.GetAppDataDirectory(), filename));
  } catch (err) {
    console.log("Error reading file: " + filename + " => " + err);

    return undefined;
  }
};

//
// ReadJson: Read a json configuration file and return a json object
//

configuration.ReadJson = function(filename) {
  //
  // TODO: Is utf-8 required here?
  //

  var json = this.Read(filename);

  if (!json) return {};

  return JSON.parse(json);
};

//
// Write: Update a configuration file with provided content
//

configuration.Write = function(filename, content) {
  var fs = require("fs");
  const path = require("path");
  try {
    fs.writeFileSync(path.join(this.GetAppDataDirectory(), filename), content);

    return true;
  } catch (err) {
    console.log("Error writing file: " + filename + " => " + err);

    return false;
  }
};

//
// WriteJson: Update a json configuration file with provided json object
//

configuration.WriteJson = function(filename, json) {
  //
  // TODO: Is utf-8 required here?
  //

  return this.Write(filename, JSON.stringify(json, null, 2)); // pretty print the json so it is human readable
};

//
// Delete: Delete the configuration file
//

configuration.Delete = function(filename) {
  var fs = require("fs");
  const path = require("path");
  try {
    fs.unlink(path.join(this.GetAppDataDirectory(), filename));

    return true;
  } catch (err) {
    console.log("Error deleting file: " + filename + " => " + err);

    return false;
  }
};

//
// Rename: Rename a configuration file
//

configuration.Rename = function(oldFilename, newFilename) {
  var fs = require("fs");
  const path = require("path");
  try {
    fs.renameSync(
      path.join(this.GetAppDataDirectory(), oldFilename),
      path.join(this.GetAppDataDirectory(), newFilename)
    );

    return true;
  } catch (err) {
    console.log("Error renaming file: " + filename + " => " + err);

    return false;
  }
};

//
// GetAppDataDirectory: Get the application data directory
//

configuration.GetAppDataDirectory = function() {
  const electron = require("electron");
  const path = require("path");
  const app = electron.app || electron.remote.app;
  let AppDataDirPath = "";

  if (process.platform === "darwin") {
    AppDataDirPath = path.join(
      app
        .getPath("appData")
        .replace(" ", `\ `)
        .replace("/Electron/", app.getName()),
      app.getName()
    );
  } else {
    AppDataDirPath = path.join(
      app.getPath("appData").replace("/Electron/", app.getName()),
      app.getName()
    );
  }

  return AppDataDirPath;
};

configuration.GetAppResourceDir = function() {
  const electron = require("electron");
  const path = require("path");
  const app = electron.app || electron.remote.app;
  let rawPath = "";
  if (process.platform === "darwin") {
    rawPath = path.dirname(app.getPath("exe")) + "/../Resources/app/";
  } else {
    rawPath = path.dirname(app.getPath("exe")) + "/resources/app/";
  }
  if (process.platform == "win32") {
    return path.win32.normalize(rawPath);
  } else {
    return path.normalize(rawPath);
  }
};

configuration.GetBootstrapSize = async function() {
  let remote = require("remote-file-size");
  const url = "http://support.nexusearth.com:8081/recent.tar.gz";

  let total = 0;
  let promise = new Promise((resolve, reject) => {
    remote(url, function(err, totalBytes) {
      resolve(totalBytes);
    });
  });
  await promise;
  return promise;
};

configuration.BootstrapRecentDatabase = async function(self) {
  const RPC = require("../script/rpc");
  const fs = require("fs");
  const path = require("path");
  const electron = require("electron");
  const tarball = require("tarball-extract");

  let totalDownloadSize = await configuration.GetBootstrapSize();

  let now = new Date()
    .toString()
    .slice(0, 24)
    .split(" ")
    .reduce((a, b) => {
      return a + "_" + b;
    })
    .replace(/:/g, "_");
  let BackupDir = process.env.HOME + "/NexusBackups";
  if (process.platform === "win32") {
    BackupDir = process.env.USERPROFILE + "/NexusBackups";
    BackupDir = BackupDir.replace(/\\/g, "/");
  }

  let ifBackupDirExists = fs.existsSync(BackupDir);
  if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
    fs.mkdirSync(BackupDir);
  }
  RPC.PROMISE("backupwallet", [
    BackupDir + "/NexusBackup_" + now + ".dat"
  ]).then(() => {
    // self.props.OpenModal("Wallet Backup");
    electron.remote.getGlobal("core").stop();
    // setTimeout(() => {
    //   self.props.CloseModal();
    // }, 3000);

    let tarGzLocation = path.join(this.GetAppDataDirectory(), "recent.tar.gz");
    if (fs.existsSync(tarGzLocation)) {
      fs.unlink(tarGzLocation, err => {
        if (err) throw err;
        console.log("recent.tar.gz was deleted");
      });
    }

    let datadir = "";

    if (process.platform === "win32") {
      datadir = process.env.APPDATA + "\\Nexus_Tritium_Data";
    } else if (process.platform === "darwin") {
      datadir = process.env.HOME + "/Nexus_Tritium_Data";
    } else {
      datadir = process.env.HOME + "/.Nexus_Tritium_Data";
    }

    const url = "http://support.nexusearth.com:8081/recent.tar.gz";
    tarball.extractTarballDownload(url, tarGzLocation, datadir, {}, function(
      err,
      result
    ) {
      fs.stat(
        configuration.GetAppDataDirectory() + "/recent.tar.gz",
        (stat, things) => console.log(stat, things)
      );
      console.log(err, result, electron.remote.getGlobal("core"));
      electron.remote.getGlobal("core").start();
    });

    let percentChecker = setInterval(() => {
      fs.stat(
        path.join(configuration.GetAppDataDirectory(), "recent.tar.gz"),
        (err, stats) => {
          console.log((stats.size / totalDownloadSize) * 100);
          self.props.setPercentDownloaded(
            (stats.size / totalDownloadSize) * 100
          );
        }
      );
    }, 5000);
    electron.remote.getGlobal("core").on("starting", () => {
      self.CloseBootstrapModalAndSaveSettings();
      clearInterval(percentChecker);
      self.props.setPercentDownloaded(0);
      self.CloseBootstrapModalAndSaveSettings();
    });
  });
};
