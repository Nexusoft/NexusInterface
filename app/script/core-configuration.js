//
// Core Configuration
// ------------------
//

var coreConfiguration = exports;

var config = require("./configuration.js");

//var config = require("./script/configuration.js");

coreConfiguration.rpchost = "http://127.0.0.1:9336";
coreConfiguration.rpcuser;
coreConfiguration.rpcpassword;

//
// ConfigExists: Check if the nexus.conf already exists
//

coreConfiguration.ConfigExists = function ()
{
    return config.Exists('nexus.conf');
}

//
// ConfigBackupExists: Check if the nexus.conf.backup already exists
//

coreConfiguration.ConfigBackupExists = function ()
{
    return config.Exists('nexus.conf.backup');
}

//
// RenameConfigToBackup: Rename the nexus.conf configuration file to nexus.conf.backup
//

coreConfiguration.RenameConfigToBackup = function ()
{
    return config.Rename('nexus.conf', 'nexus.conf.backup');
}

//
// GenerateConfig: Generate the nexus.conf configuration file with dynamically set credentials
//

coreConfiguration.GenerateConfig = function ()
{
    var fs = require('fs');
    var os = require("os");

    // Set up the configurations that will be written to the file
    var rpcuser = "rpcserver";
    var rpcpassword = this.GeneratePassword();
    var mining = "1";
    var llpallowip = "*.*.*.*:8325";

    this.rpcuser = rpcuser;
    this.rpcpassword = rpcpassword;

    // Concatenate the settings that wille be written to the file
    var content = "rpcuser=" + rpcuser + os.EOL + "rpcpassword=" + rpcpassword + os.EOL + "mining=" + mining + os.EOL + "llpallowip=" + llpallowip;

    // If the configuration file was there rename it to backup (if there isn't already a backup)
    if(this.ConfigExists() && !this.ConfigBackupExists()) {
        this.RenameConfigToBackup();
    }

    config.Write('nexus.conf', content)
}

//
// DeleteConfig: Delete the nexus.conf configuration file, call this at app or core shutdown
//

coreConfiguration.DeleteConfig = function ()
{
    return config.Delete('nexus.conf');
}

//
// GetResourcesDirectory: Get the path to local resources for the application (depending on running packaged vs via npm start)
//

coreConfiguration.GetResourcesDirectory = function ()
{
    let appPath = require('electron').remote.app.getAppPath();

    if (process.cwd() === appPath)
        return "./";
    else
        return process.resourcesPath + "/";
}

//
// GetCoreBinaryPath: Get the path to the specific core binary for the user's system
//

coreConfiguration.GetCoreBinaryPath = function ()
{
    var coreBinaryPath = this.GetResourcesDirectory() + "cores/nexus" + "-" + process.platform + "-" + process.arch;

    if(process.platform === "win32") {
        coreBinaryPath += ".exe";
    }

    return coreBinaryPath;
}

//
// CoreBinaryExists: Check if the core binary for the user's system exists or not
//

coreConfiguration.CoreBinaryExists = function ()
{
    var fs = require("fs");

    console.debug("Checking if core binary exists: " + coreConfiguration.GetCoreBinaryPath());

    try {
        fs.accessSync(this.GetCoreBinaryPath());

        console.debug("Core binary exists");

        return true;
    }
    catch(e) {

        console.log("Core binary does not exist: " + coreConfiguration.GetCoreBinaryPath());

        return false;
    }
}

//
// GeneratePassword: Generate a random password for temporary wireup of the Nexus Core with the Nexus Wallet
//

coreConfiguration.GeneratePassword = function ()
{
    return require('crypto').randomBytes(64).toString('hex');
}