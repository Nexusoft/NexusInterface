import configuration from "./configuration";
const log = require("electron-log");
const statusdelay = 1000;

var coreprocess = null;
var settings = require("./settings");
var responding = false;

var user = "rpcserver";
var password = require("crypto")
      .randomBytes(32)
      .toString("hex");
var host;
var port;
var ip;

//Set data directory by OS for automatic daemon mode
if (process.platform === "win32") {
  var datadir = process.env.APPDATA + "\\nexus-interface";
} else if (process.platform === "darwin") {
  var datadir = process.env.HOME + "/Library/Application\ Support/nexus-interface";
} else {
  var datadir = process.env.HOME + "/.config/nexus-interface";
}

const EventEmitter = require("events");

// SetCoreParameters: Get the path to local resources for the application (depending on running packaged vs via npm start)
function SetCoreParameters(settings) {
  let parameters = [];
  let ip, port;
  // set up the user/password/host for RPC communication
  if (settings.manualDaemon == true) {
     ip =
      settings.manualDaemonIP === undefined
        ? "127.0.0.1"
        : settings.manualDaemonIP;
     port =
      settings.manualDaemonPort === undefined
        ? "9336"
        : settings.manualDaemonPort;
    user =
      settings.manualDaemonUser === undefined
        ? user
        : settings.manualDaemonUser;
    password =
      settings.manualDaemonPassword === undefined
        ? "password"
        : settings.manualDaemonPassword;
    datadir =
      settings.manualDaemonDataDir === undefined
        ? datadir
        : settings.manualDaemonDataDir;
    host = "http://" + ip + ":" + port;
  } else {
    user = user;
    password = password;
    port = "9336";
    ip = "127.0.0.1";
    host = "http://" + ip + ":" + port;

  }

  // Set up parameters for calling the core executable (manual daemon mode simply won't use them)
  parameters.push("-rpcuser=" + user);
  parameters.push("-rpcpassword=" + password);
  parameters.push("-rpcport=" + port);
  parameters.push("-datadir=" + datadir);
  parameters.push("-printtoconsole"); // Enable console functionality via stdout
  parameters.push("-server");
  parameters.push("-verbose=" + "2"); // <-- Make a setting for this
  parameters.push("-rpcallowip=" + ip);
  // Disable upnp (default is 1)
  if (settings.mapPortUsingUpnp == false) parameters.push("-upnp=0");

  // Connect through SOCKS4 proxy
  if (settings.socks4Proxy == true)
    parameters.push(
      "-proxy=" + settings.socks4ProxyIP + ":" + settings.socks4ProxyPort
    );

  // Enable mining (default is 0)
  if (settings.enableMining == true) {
    parameters.push("-mining=1");
    parameters.push("-llpallowip=127.0.0.1:9336");
  }

  // Enable staking (default is 0)
  if (settings.enableStaking == true) parameters.push("-stake=1");

  // Enable detach database on shutdown (default is 0)
  if (settings.detatchDatabaseOnShutdown == true)
    parameters.push("-detachdb=1");

  log.info("Core Parameters: " + parameters.toString());
  return parameters;
}

// GetResourcesDirectory: Get the path to local resources for the application (depending on running packaged vs via npm start)
function GetResourcesDirectory() {
  return "app/";
}

// GetCoreBinaryPath: Get the path to the specific core binary for the user's system
function GetCoreBinaryPath() {
  const path = require("path");
  var coreBinaryPath = path.join(
    configuration.GetAppResourceDir(),
    "cores/nexus" +
    "-" +
    process.platform +
    "-" +
    process.arch
  );
  if (process.platform === "win32") {
    coreBinaryPath += ".exe";
  }
  return coreBinaryPath;
}

// CoreBinaryExists: Check if the core binary for the user's system exists or not
function CoreBinaryExists() {
  var fs = require("fs");
  log.info("Checking if core binary exists: " + GetCoreBinaryPath());
  try {
    fs.accessSync(GetCoreBinaryPath());
    log.info("Core binary exists");
    return true;
  } catch (e) {
    log.info("Core binary does not exist: " + GetCoreBinaryPath());
    return false;
  }
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

  start() {
    if (coreprocess != null) return;
    let settings = require("./settings").GetSettings();
    let parameters = SetCoreParameters(settings);
    if (settings.manualDaemon == true) {
      log.info("Core Manager: Manual daemon mode, skipping starting core");
    } else {
      if (CoreBinaryExists()) {
        log.info("Core Manager: Starting core");
        var spawn = require("child_process").spawn;
        coreprocess = spawn(GetCoreBinaryPath(), parameters, { shell: false });
        coreprocess.on("error", err => {
          log.info("Core Manager: Core has returned an error: " + err);
        });
        coreprocess.once("exit", (code, signal) => {
          log.info("Core Manager: Core has exited unexpectedly");
        });
        coreprocess.once("close", (code, signal) => {
          log.info("Core Manager: Core stdio streams have closed unexpectedly");
        });
        if (coreprocess != null)
          log.info(
            "Core Manager: Core has started (process id: " +
              coreprocess.pid +
              ")"
          );
      } else {
        log.info(
          "Core Manager: Core not found, please run in manual deamon mode"
        );
      }
    }
    this.emit("starting");
  }

  // stop: Stop the core from running by sending SIGTERM to the process
  stop(callback) {
    // if coreprocess is null we were in manual daemon mode, just exec the callback
    if (coreprocess == null) {
      if (callback) callback();
      return;
    }
    log.info(
      "Core Manager: Core is stopping (process id: " + coreprocess.pid + ")"
    );
    var _this = this;
    coreprocess.once("error", err => {
      log.info("Core Manager: Core has returned an error: " + err);
    });
    coreprocess.once("exit", (code, signal) => {
      log.info("Core Manager: Core has exited");
    });
    coreprocess.once("close", (code, signal) => {
      log.info("Core Manager: Core stdio streams have closed");
      //_this.removeListener('close', _this.onClose);
      coreprocess = null;
      responding = false;
      if (callback) callback();
    });
    coreprocess.kill();
    this.emit("stopping");
  }

  // restart: Restart the core process
  restart() {
    var _this = this;
    this.stop(function() {
      _this.start();
    });
  }
}

module.exports = new Core();
