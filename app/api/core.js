import configuration from './configuration';
import MenuBuilder from 'menu.js';
import { GetSettings, SaveSettings } from './settings';
import { resolve } from 'path';

import * as RPC from 'scripts/rpc';

const cp = require('child_process');
const spawn = require('cross-spawn');
const log = require('electron-log');
const statusdelay = 1000;
const crypto = require('crypto');
var prevCoreProcess = 0;

var coreprocess = null;
var settings = require('./settings');
var responding = false;
var user = 'rpcserver';
//Generate automatic daemon password from machines hardware info
var macaddress = require('macaddress');
var secret = 'secret';
if (process.platform === 'darwin') {
  const secret = process.env.USER + process.env.HOME + process.env.SHELL;
} else {
  const secret = JSON.stringify(macaddress.networkInterfaces(), null, 2);
}
var password = crypto
  .createHmac('sha256', secret)
  .update('pass')
  .digest('hex');

var port = '9336';
var ip = '127.0.0.1';
var host = 'http://' + ip + ':' + port;
var verbose = '2'; // <--Lower to 0 after beta ends

//Set data directory by OS for automatic daemon mode
if (process.platform === 'win32') {
  var datadir = process.env.APPDATA + '\\Nexus_Tritium_Data';
} else if (process.platform === 'darwin') {
  var datadir = process.env.HOME + '/Nexus_Tritium_Data';
} else {
  var datadir = process.env.HOME + '/.Nexus_Tritium_Data';
}

const EventEmitter = require('events');

// SetCoreParameters: Get the path to local resources for the application (depending on running packaged vs via npm start)
function SetCoreParameters(settings) {
  var parameters = [];

  // set up the user/password/host for RPC communication
  if (settings.manualDaemon == true) {
    ip =
      settings.manualDaemonIP === undefined
        ? '127.0.0.1'
        : settings.manualDaemonIP;
    port =
      settings.manualDaemonPort === undefined
        ? '9336'
        : settings.manualDaemonPort;
    user =
      settings.manualDaemonUser === undefined
        ? user
        : settings.manualDaemonUser;
    password =
      settings.manualDaemonPassword === undefined
        ? password
        : settings.manualDaemonPassword;
    datadir =
      settings.manualDaemonDataDir === undefined
        ? datadir
        : settings.manualDaemonDataDir;
    host = 'http://' + ip + ':' + port;
  } else {
    user = user;
    password = password;
  }
  verbose =
    settings.verboseLevel === undefined ? verbose : settings.verboseLevel;

  var forkblockCount =
    settings.forkblocks === undefined ? 0 : settings.forkblocks;

  // Set up parameters for calling the core executable (manual daemon mode simply won't use them)
  parameters.push('-rpcuser=' + user);
  parameters.push('-rpcpassword=' + password);
  parameters.push('-rpcport=' + port);
  parameters.push('-datadir=' + datadir);
  parameters.push('-daemon');
  parameters.push('-avatar');
  parameters.push('-server');
  parameters.push('-verbose=' + verbose); // <-- Make a setting for this
  parameters.push('-rpcallowip=' + ip);
  // Disable upnp (default is 1)
  if (settings.mapPortUsingUpnp == false) parameters.push('-upnp=0');

  // Connect through SOCKS4 proxy
  if (settings.socks4Proxy == true)
    parameters.push(
      '-proxy=' + settings.socks4ProxyIP + ':' + settings.socks4ProxyPort
    );

  // Enable mining (default is 0)
  if (settings.enableMining == true) {
    parameters.push('-mining=1');
    parameters.push('-llpallowip=127.0.0.1:9325');
  }

  // Enable staking (default is 0)
  if (settings.enableStaking == true) parameters.push('-stake=1');

  // Enable detach database on shutdown (default is 0)
  if (settings.detatchDatabaseOnShutdown == true)
    parameters.push('-detachdb=1');

  if (forkblockCount !== 0) {
    parameters.push('-forkblocks=' + forkblockCount);
    settings.forkblocks = 0;
    SaveSettings(settings);
    console.log('Saved New Settings');
  }

  log.info('Core Parameters: ' + parameters.toString());
  return parameters;
}

// GetResourcesDirectory: Get the path to local resources for the application (depending on running packaged vs via npm start)
function GetResourcesDirectory() {
  return 'app/';
}

// GetCoreBinaryName: Gets the name of the executable.
function GetCoreBinaryName() {
  var coreBinaryName = 'nexus' + '-' + process.platform + '-' + process.arch;
  if (process.platform === 'win32') {
    coreBinaryName += '.exe';
  }
  return coreBinaryName;
}

// GetCoreBinaryPath: Get the path to the specific core binary for the user's system
function GetCoreBinaryPath() {
  const path = require('path');
  if (process.env.NODE_ENV === 'development') {
    let appDir = __dirname.split('/api');

    var coreBinaryPath = path.normalize(
      path.join(appDir[0], 'cores', GetCoreBinaryName())
    );
  } else {
    var coreBinaryPath = path.join(
      configuration.GetAppResourceDir(),
      'cores',
      GetCoreBinaryName()
    );
  }
  return coreBinaryPath;
}

// Determine if daemon running and if so, get PID
function getCorePID() {
  var execSync = require('child_process').execSync;
  var modEnv = process.env;
  modEnv.Nexus_Daemon = GetCoreBinaryName();
  if (process.platform == 'win32') {
    var PID = (
      execSync(
        'tasklist /NH /v /fi "IMAGENAME eq %Nexus_Daemon%" /fo CSV',
        [],
        { env: modEnv }
      ) + ''
    ).split(',')[1];
    if (PID) {
      PID = PID.replace(/"/gm, '');
    }
    log.info('PID: ' + PID);
    if (Number(PID) == 'NaN' || Number(PID) < '2') {
      return 1;
    } else {
      return Number(PID);
    }
  } else if (process.platform == 'darwin') {
    var tempPID = (
      execSync('ps -A', [], {
        env: modEnv,
      }) + ''
    )
      .split('\n')
      .filter(process => {
        if (process.includes(GetCoreBinaryPath())) {
          return process;
        }
      });
    console.log(tempPID);

    if (tempPID[0]) {
      tempPID = tempPID[0].trim().split(' ')[0];
    }
    console.log(tempPID);
    var PID = tempPID.toString().replace(/^\s+|\s+$/gm, '');
    log.info('PID: ' + PID);
    if (Number(PID) == 'NaN' || Number(PID) < '2') {
      return 1;
    } else {
      return Number(PID);
    }
  } else {
    var tempPID = (
      execSync('ps -o pid --no-headers -p 1 -C ${Nexus_Daemon}', [], {
        env: modEnv,
      }) + ''
    )
      .split('\n')[1]
      .replace(/^\s*/gm, '')
      .split(' ')[0];
    var PID = tempPID.toString().replace(/^\s+|\s+$/gm, '');
    log.info('PID: ' + PID);
    if (Number(PID) == 'NaN' || Number(PID) < '2') {
      return 1;
    } else {
      return Number(PID);
    }
  }
}

// If daemon is running, get it's parent PID
function getCoreParentPID() {
  const util = require('util');
  var execSync = require('child_process').execSync;
  var modEnv = process.env;
  modEnv.Nexus_Daemon = GetCoreBinaryName();
  modEnv.Daemon_PID = getCorePID();
  if (
    modEnv.Daemon_PID == null ||
    modEnv.Daemon_PID == undefined ||
    modEnv.Daemon_PID === 'NaN'
  ) {
    modEnv.Daemon_PID = 0;
  }
  if (process.platform == 'win32') {
    var PPID = (
      execSync(
        'wmic process where (processid=%DAEMON_PID%) get parentprocessid',
        [],
        { env: modEnv }
      ) + ''
    ).split('\n')[1];
  } else {
    var tempPPID = (
      execSync('ps -o ppid --no-headers -p 1 -C ${Nexus_Daemon}', [], {
        env: modEnv,
      }) + ''
    )
      .split('\n')[1]
      .replace(/^\s*/gm, '')
      .split(' ')[0];
    var PPID = tempPPID.toString().replace(/^\s+|\s+$/gm, '');
  }
  log.info('PPID = ' + PPID);
  if (Number(PPID) == 'NaN' || Number(PPID) < '2') {
    return null;
  } else {
    return Number(PPID);
  }
}

// CoreBinaryExists: Check if the core binary for the user's system exists or not
function CoreBinaryExists() {
  var fs = require('fs');
  log.info('Checking if core binary exists: ' + GetCoreBinaryPath());
  try {
    fs.accessSync(GetCoreBinaryPath());
    log.info('Core binary exists');
    return true;
  } catch (e) {
    log.info('Core binary does not exist: ' + GetCoreBinaryPath());
    return false;
  }
}

/*// isCoreRunning: Determine if core is running and return it's PID.
function isCoreRunning() {
  var ps = require('ps-node');
  var runningPID = ps.lookup({
    command: 'nexus-linux-x64',
  }, function(err, resultList ) {
    if (err) {
      log.info( 'findPID error: ' + (err) );
    }

//    resultList.forEach(function( process ){
//      if(process) {
//        log.info( 'PID: %s, COMMAND: %s, ARGUMENTS: %s, process.pid, process.command, process.arguments );
//      }

    if (resultList.length > 0) {
      var output = resultList[ 0 ];
    } else {
      var output = null;
    }
    log.info('ps.node output: ' + output);
    return output;
  });
  log.info('runningPID inside function: ' + runningPID);
  return runningPID;
}
*/
// rpcGet: Send a message to the RPC
function rpcGet(command, args, callback) {
  var postdata = JSON.stringify({
    method: command,
    params: args,
  });
  rpcPost(host, postdata, 'TAG-ID-deprecate', callback, user, password);
}

// rpcPost: Send a message to the RPC
function rpcPost(
  address,
  postdata,
  tagid,
  callback,
  username,
  passwd,
  content
) {
  var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  var response = new XMLHttpRequest();
  /** Handle the Tag ID being omitted. **/
  if (tagid == undefined) tagid = '';
  /** Establish the Callback Function. **/
  response.onreadystatechange = function() {
    if (callback != undefined) callback(response, address, postdata, tagid);
  };
  /** Generate the AJAX Request. **/
  if (username == undefined && passwd == undefined)
    response.open('POST', address, true);
  else response.open('POST', address, true, username, passwd);
  if (content !== undefined) response.setRequestHeader('Content-type', content);
  /** Send off the Post Data. **/
  response.send(postdata);
}

class Core extends EventEmitter {
  constructor() {
    super();
  }
  get user() {
    return user;
  }
  get password() {
    return password;
  }
  get host() {
    return host;
  }
  get event() {
    return eventEmitter;
  }
  get process() {
    return coreprocess;
  }
  get isresponding() {
    return responding;
  }
  get ip() {
    return ip;
  }
  get port() {
    return port;
  }

  // checkresponding: Check if the core is responding to incoming RPC requests
  checkresponding() {
    var _this = this;
    rpcGet('getinfo', [], function(response, address, postdata) {
      if (response.readyState != 4) return;
      if (response.status != 200) {
        log.info('Core Manager: Waiting for core to respond for requests');
        setTimeout(function() {
          _this.checkresponding();
        }, statusdelay);
      } else {
        log.info('Core Manager: Core is ready for requests');
        responding = true;
        _this.emit('started');
      }
    });
    return;
  }

  // start: Start up the core with necessary parameters and return the spawned process
  start(refToThis) {
    let settings = GetSettings();
    let parameters = SetCoreParameters(settings);
    let coreBinaryPath = GetCoreBinaryPath();
    let coreBinaryName = GetCoreBinaryName();
    let corePID = getCorePID();
    // let daemonProcs = utils.findPID("nexus-linux-x64");

    if (settings.manualDaemon == true) {
      log.info('Core Manager: Manual daemon mode, skipping starting core');
    } else if (corePID > '1') {
      log.info(
        'Core Manager: Daemon Process already running. Skipping starting core'
      );
      var prevCoreProcess = corePID;
    } else {
      log.info('isCoreRunning() output: ' + corePID);
      if (CoreBinaryExists()) {
        var fs = require('fs');
        if (!fs.existsSync(datadir)) {
          log.info(
            'Core Manager: Data Directory path not found. Creating folder: ' +
              datadir
          );
          fs.mkdirSync(datadir);
        }
        log.info('Core Manager: Starting core');
        var coreprocess = spawn(GetCoreBinaryPath(), parameters, {
          shell: false,
          detached: true,
          stdio: ['ignore', 'ignore', 'ignore'],
        });
        if (coreprocess != null)
          log.info(
            'Core Manager: Core has started (process id: ' +
              coreprocess.pid +
              ')'
          );
      } else {
        log.info(
          'Core Manager: Core not found, please run in manual deamon mode'
        );
      }
    }

    if (refToThis) {
      refToThis.emit('starting');
    } else {
      this.emit('starting');
    }
  }

  // stop: Stop the core from running by sending SIGTERM to the process
  stop(callback, refToThis) {
    return new Promise((resolve, reject) => {
      log.info('Core Manager: Stop function called');
      let settings = GetSettings();
      let coreBinaryName = GetCoreBinaryName();
      let corePID = getCorePID();
      // let coreParentPID = getCoreParentPID();
      var cp = require('child_process');
      var execSync = require('child_process').execSync;
      var modEnv = process.env;
      modEnv.KILL_PID = corePID;
      var _this = this;

      if (settings.keepDaemon != true) {
        if (corePID > '1') {
          try {
            rpcGet('stop', []);
          } catch (e) {
            console.log(e);
          }
          setTimeout(() => {
            if (getCorePID() > '1') {
              setTimeout(() => {
                log.info('Core Manager: Killing process ' + corePID);
                if (require('is-running')(corePID)) {
                  if (process.platform == 'win32') {
                    execSync('taskkill /F /PID %KILL_PID%', [], {
                      env: modEnv,
                    });
                  } else {
                    execSync('kill -9 $KILL_PID', [], { env: modEnv });
                  }

                  if (callback) {
                    setTimeout(() => {
                      callback(refToThis);
                    }, 3000);
                  }
                  resolve('Stopping');
                }
              }, 5000);
            } else {
              if (callback) {
                setTimeout(() => {
                  callback(refToThis);
                }, 3000);
              }
              resolve('Stopping');
            }
          }, 5000);
        } else {
          if (callback) {
            setTimeout(() => {
              callback(refToThis);
            }, 3000);
          }
          resolve('Stopping');
        }
      } else {
        log.info('Core Manager: Closing wallet and leaving daemon running.');
      }
    });
  }

  // restart: Restart the core process
  restart() {
    let settings = GetSettings();
    settings.keepDaemon = false;
    SaveSettings(settings);
    var _this = this;
    this.stop(this.start, _this);
  }
}

module.exports = new Core();
