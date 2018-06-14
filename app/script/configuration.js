////////////////////////////////////////////////////////////////////////////////
//
// Configuration Manager
//
////////////////////////////////////////////////////////////////////////////////

var configuration = exports;

//
// Exists: Check if a configuration file exists
//

configuration.Exists = function (filename)
{
    var fs = require("fs");

    try {

        fs.accessSync(this.GetAppDataDirectory() + filename);

        console.debug("Configuration file exists: " + this.GetAppDataDirectory() + filename);

        return true;
    }
    catch (err) {

        console.debug("Configuration file does not exist: " + this.GetAppDataDirectory() + filename);

        return false;
    }
}

//
// Read: Read a configuration file
//

configuration.Read = function (filename)
{
    var fs = require('fs');

    try {

        return fs.readFileSync(this.GetAppDataDirectory() + filename);

    }
    catch (err) {

        console.debug("Error reading file: " + filename + " => " + err);  

        return undefined;
    }
}

//
// ReadJson: Read a json configuration file and return a json object
//

configuration.ReadJson = function (filename)
{
    //
    // TODO: Is utf-8 required here?
    //

    var json = this.Read(filename);
    
    if (!json)
        return {};

    return JSON.parse(json);
}

//
// Write: Update a configuration file with provided content
//

configuration.Write = function (filename, content)
{
    var fs = require('fs');

    try {
        fs.writeFileSync(this.GetAppDataDirectory() + filename, content);

        console.debug("Configuration file updated: " + filename);

        return true;
    }
    catch (err) {

        console.error("Error writing file: " + filename + " => " + err);   

        return false;
    }
}

//
// WriteJson: Update a json configuration file with provided json object
//

configuration.WriteJson = function (filename, json)
{
    //
    // TODO: Is utf-8 required here?
    //

    return this.Write(filename, JSON.stringify(json, null, 2));     // pretty print the json so it is human readable
}

//
// Delete: Delete the configuration file
//

configuration.Delete = function (filename)
{
    var fs = require('fs');

    try {

        fs.unlink(this.GetAppDataDirectory() + filename);

        console.debug("Configuration file deleted: " + filename);

        return true;
    }
    catch (err) {

        console.error("Error deleting file: " + filename + " => " + err);   

        return false;                                                                               
    } 
}

//
// Rename: Rename a configuration file
//

configuration.Rename = function (oldFilename, newFilename)
{
    var fs = require("fs");

    try {
        fs.renameSync(this.GetAppDataDirectory() + oldFilename, this.GetAppDataDirectory() + newFilename);

        console.debug("Configuration file renamed: " + oldFilename + " to " + newFilename);

        return true;
    }
    catch (err) {

        console.error("Error renaming file: " + filename + " => " + err);   

        return false;
    }
}

//
// GetAppDataDirectory: Get the application data directory
//

configuration.GetAppDataDirectory = function ()
{
    var appdata = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME);

    return appdata + "/.Nexus/";
}