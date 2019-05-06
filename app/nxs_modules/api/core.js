import crypto from 'crypto';
import spawn from 'cross-spawn';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import macaddress from 'macaddress';
import childProcess from 'child_process';
import xmlhttprequest from 'xmlhttprequest';
import btoa from 'btoa';
import configuration from 'api/configuration';
import { LoadSettings, UpdateSettings } from 'api/settings';

let nexusconfig = {};
function loadNexusConf() {
  if (fs.existsSync(path.join(configuration.GetCoreDataDir(), 'nexus.conf'))) {
    log.info('nexus.conf exists. Importing username and password.');
    let nexusConfiguratiions = fs
      .readFileSync(path.join(configuration.GetCoreDataDir(), 'nexus.conf'))
      .toString()
      .split(`\n`);
    nexusconfig = {
      user: nexusConfiguratiions[0].replace('rpcuser=', ''),
      password: nexusConfiguratiions[1].replace('rpcpassword=', ''),
    };
  }
}

function setpassword() {
  let secret = 'secret';
  if (process.platform === 'darwin') {
    secret = process.env.USER + process.env.HOME + process.env.SHELL;
  } else {
    secret = JSON.stringify(macaddress.networkInterfaces(), null, 2);
  }

  return (
    nexusconfig.password ||
    crypto
      .createHmac('sha256', secret)
      .update('pass')
      .digest('hex')
  );
}

// rpcStop: Send a stop message through the RPC
function rpcStop(host, user, password) {
  return new Promise((resolve, reject) => {
    var XMLHttpRequest = xmlhttprequest.XMLHttpRequest;
    var response = new XMLHttpRequest();

    /** Establish the Callback Function. **/
    response.onload = function() {
      if (response.status == 200) {
        resolve(true);
      } else {
        reject();
      }
    };

    /** Generate the AJAX Request. **/
    if (user == undefined && password == undefined)
      response.open('POST', host, true);
    else response.open('POST', host, true, user, password);
    response.setRequestHeader(
      'Authorization',
      'Basic ' + btoa(user + ':' + password)
    );
    /** Send off the Post Data. **/
    response.send(
      JSON.stringify({
        method: 'stop',
        params: [],
      })
    );
  });
}

function getCorePID() {
  var execSync = childProcess.execSync;
  var modEnv = process.env;
  modEnv.Nexus_Daemon = GetCoreBinaryName();

  if (process.platform == 'win32') {
    var PID = (
      execSync(
        `tasklist /NH /v /fi "IMAGENAME eq ${modEnv.Nexus_Daemon}" /fo CSV`,
        [],
        { env: modEnv }
      ) + ''
    ).split(',')[1];
    if (PID) {
      PID = PID.replace(/"/gm, '');
    }

    if (Number(PID) == 'NaN' || Number(PID) < '2' || PID === undefined) {
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

    if (tempPID[0]) {
      tempPID = tempPID[0].trim().split(' ')[0];
    }

    var PID = tempPID.toString().replace(/^\s+|\s+$/gm, '');

    if (Number(PID) == 'NaN' || Number(PID) < '2' || PID === undefined) {
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

    if (Number(PID) == 'NaN' || Number(PID) < '2' || PID === undefined) {
      return 1;
    } else {
      return Number(PID);
    }
  }
}

function GetCoreBinaryName() {
  var coreBinaryName = 'nexus' + '-' + process.platform + '-' + process.arch;
  if (process.platform === 'win32') {
    coreBinaryName += '.exe';
  }
  return coreBinaryName;
}

function GetCoreBinaryPath() {
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

function CoreBinaryExists() {
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

export default class Core {
  constructor() {
    loadNexusConf();
    this.user = nexusconfig.user || 'rpcserver';
    this.password = setpassword();
    this.coreprocess;
    this._ip = '127.0.0.1';
    this._port = '9336';
    this.host = 'http://' + this.ip + ':' + this.port;
    this.start = this.start;
    this.stop = this.stop;
    this.restart = this.restart;
    this.verbose = '2';
  }

  get port() {
    return this._port;
  }
  set port(val) {
    this._port = val;
    this.host = 'http://' + this._ip + ':' + this._port;
  }
  get ip() {
    return this._ip;
  }
  set ip(val) {
    this._ip = val;
    this.host = 'http://' + this._ip + ':' + this._port;
  }

  // start: Start up the core with necessary parameters and return the spawned process
  start() {
    var datadir = configuration.GetCoreDataDir();
    let settings = LoadSettings();
    let corePID = getCorePID();

    if (settings.manualDaemon == true) {
      this.ip = settings.manualDaemonIP || '127.0.0.1';
      this.port = settings.manualDaemonPort || '9336';
      this.user = settings.manualDaemonUser || this.user;
      this.password = settings.manualDaemonPassword || this.password;
      this.datadir = settings.manualDaemonDataDir || datadir;

      log.info('Core Manager: Manual daemon mode, skipping starting core');
    } else if (corePID > 1) {
      log.info(
        'Core Manager: Daemon Process already running. Skipping starting core'
      );
    } else {
      loadNexusConf();
      if (CoreBinaryExists()) {
        if (!fs.existsSync(datadir)) {
          log.info(
            'Core Manager: Data Directory path not found. Creating folder: ' +
              datadir
          );
          fs.mkdirSync(datadir);
        }
        if (!fs.existsSync(path.join(datadir, 'nexus.conf'))) {
          fs.writeFileSync(
            path.join(datadir, 'nexus.conf'),
            `rpcuser=${this.user}\nrpcpassword=${this.password}\n`
          );
        }
        this.verbose = settings.verboseLevel || this.verbose;
        let parameters = [
          `-rpcport=${this.port}`,
          `-datadir=${datadir}`,
          '-daemon',
          '-avatar',
          '-server',
          '-fastsync',
          '-rpcthreads=4',
          '-beta',
          `-verbose=${this.verbose}`,
          `-rpcallowip=${this.ip}`,
        ];
        if (settings.forkBlocks) {
          parameters.push('-forkblocks=' + settings.forkBlocks);
          UpdateSettings({ forkBlocks: 0 });
        }
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
        if (settings.detatchDatabaseOnShutdown == true) {
          parameters.push('-detachdb=1');
        }
        log.info('Core Parameters: ' + parameters.toString());

        log.info('Core Manager: Starting core');

        let coreprocess = spawn(GetCoreBinaryPath(), parameters, {
          shell: false,
          detached: true,
          stdio: ['ignore', 'ignore', 'ignore'],
        });

        if (coreprocess != null) {
          this.coreprocess = coreprocess;
          log.info(
            'Core Manager: Core has started (process id: ' +
              this.coreprocess.pid +
              ')'
          );
        }
      } else {
        log.info(
          'Core Manager: Core not found, please run in manual deamon mode'
        );
      }
    }
  }

  // stop: Stop the core from running by sending stop command or SIGTERM to the process
  stop(restart) {
    return new Promise((resolve, reject) => {
      log.info('Core Manager: Stop function called');
      let settings = LoadSettings();

      var execSync = childProcess.execSync;
      var modEnv = process.env;
      modEnv.KILL_PID = getCorePID();

      if (settings.keepDaemon != true) {
        rpcStop(this.host, this.user, this.password);
        let seconds = 0;
        let stopFailsafe = setInterval(() => {
          let corePID = getCorePID();

          if (corePID > 1 && seconds < 30) {
            seconds++;
            log.info(
              `Core Manager: Core still running after stop command for: ${seconds} seconds, CorePID: ${corePID}`
            );
          } else if (corePID === 1) {
            clearInterval(stopFailsafe);
            log.info(`Core Manager: Core stopped gracefully.`);
            setTimeout(() => {
              if (restart) this.start();
            }, 1);

            resolve('Core stopped');
          } else {
            log.info('Core Manager: Killing process ' + corePID);

            if (process.platform == 'win32') {
              execSync(`taskkill /F /PID ${corePID}`, [], {
                env: modEnv,
              });
            } else {
              execSync('kill -9 $KILL_PID', [], { env: modEnv });
            }
            clearInterval(stopFailsafe);

            setTimeout(() => {
              if (restart) this.start();
            }, 1);
            resolve('Core stopped');
          }
        }, 1000);
      } else {
        log.info('Core Manager: Closing wallet and leaving daemon running.');
      }
    });
  }

  // restart: Restart the core process
  restart() {
    this.stop(true);
  }
}
