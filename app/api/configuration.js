////////////////////////////////////////////////////////////////////////////////
//
// Configuration Manager
//
////////////////////////////////////////////////////////////////////////////////

var configuration = exports;

//
// Exists: Check if a configuration file exists
//

configuration.Exists = function(filename) {
  var fs = require("fs");

  try {
    fs.accessSync(this.GetAppDataDirectory() + filename);

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

  try {
    console.log(this.GetAppDataDirectory() + filename);
    return fs.readFileSync(this.GetAppDataDirectory() + filename);
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

  try {
    fs.writeFileSync(this.GetAppDataDirectory() + filename, content);

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

  try {
    fs.unlink(this.GetAppDataDirectory() + filename);

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

  try {
    fs.renameSync(
      this.GetAppDataDirectory() + oldFilename,
      this.GetAppDataDirectory() + newFilename
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

  return path.join(app.getPath("appData"), app.getName()) + "/";
};
