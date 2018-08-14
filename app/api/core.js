//
// Core Manager
// ------------------
//

//
// Private
//

const log = require("electron-log");
const statusdelay = 1000;

var user = "rpcserver";
var password = require('crypto').randomBytes(64).toString('hex');
var host = "http://127.0.0.1:9336";

var coreprocess = null;
var settings = require("./settings");
var responding = false;

const EventEmitter = require('events');

//
// SetCoreParameters: Get the path to local resources for the application (depending on running packaged vs via npm start)
//

function SetCoreParameters(settings)
{
    let parameters = [];

    //
    // set up the user/password/host for RPC communication
    //

    if (settings.manualDaemon == true) {

        let ip = (settings.manualDaemonIP === undefined ? "127.0.0.1" : settings.manualDaemonIP);
        let port = (settings.manualDaemonPort === undefined ? "9336" : settings.manualDaemonPort);

        user = (settings.manualDaemonUser === undefined ? "rpcserver" : settings.manualDaemonUser);
        password = (settings.manualDaemonPassword === undefined ? "password" : settings.manualDaemonPassword);
        host = "http://" + ip + ":" + port;

    }
    else {

        user = "rpcserver";
        password = require('crypto').randomBytes(32).toString('hex');
        host = "http://127.0.0.1:9336";

    }

    //
    // Set up parameters for calling the core executable (manual daemon mode simply won't use them)
    //

    parameters.push("-rpcuser=" + user);
    parameters.push("-rpcpassword=" + password);
    parameters.push("-printtoconsole");                     // Enable console functionality via stdout
    parameters.push("-verbose=" + "2");                     // <-- Make a setting for this
    parameters.push("-llpallowip=" + "127.0.0.1:8325");       // <-- Make a setting for this

    // Disable upnp (default is 1)
    if (settings.mapPortUsingUpnp == false)
        parameters.push("-upnp=0");

    // Connect through SOCKS4 proxy
    if (settings.socks4Proxy == true)
        parameters.push("-proxy=" + settings.socks4ProxyIP + ":" + settings.socks4ProxyPort)

    // Enable mining (default is 0)
    if (settings.miningEnabled == true)
        parameters.push("-mining=1");

    // Enable detach database on shutdown (default is 0)
    if (settings.detatchDatabaseOnShutdown == true)
        parameters.push("-detachdb=1");

    log.info("Core Parameters: " + parameters.toString());

    return parameters;
}

//
// GetResourcesDirectory: Get the path to local resources for the application (depending on running packaged vs via npm start)
//

function GetResourcesDirectory()
{
    //TODO: Test this under a packaged environment to make sure the /cores folder is found correctly

    // let appPath = require('electron').app.getAppPath();

    // if (process.cwd() === appPath)
    //     return "./";
    // else
    //     return process.resourcesPath + "/";

    return "app/";
}

//
// GetCoreBinaryPath: Get the path to the specific core binary for the user's system
//

function GetCoreBinaryPath()
{
    var coreBinaryPath = GetResourcesDirectory() + "cores/nexus" + "-" + process.platform + "-" + process.arch;

    if(process.platform === "win32") {
        coreBinaryPath += ".exe";
    }

    return coreBinaryPath;
}

//
// CoreBinaryExists: Check if the core binary for the user's system exists or not
//

function CoreBinaryExists()
{
    var fs = require("fs");

    log.info("Checking if core binary exists: " + GetCoreBinaryPath());

    try {

        fs.accessSync(GetCoreBinaryPath());

        log.info("Core binary exists");

        return true;
    }
    catch(e) {

        log.info("Core binary does not exist: " + GetCoreBinaryPath());

        return false;
    }
}

//
// rpcGet: Send a message to the RPC
//

function rpcGet(command, args, callback) {

    var postdata = JSON.stringify({
      method: command,
      params: args
    });
  
    rpcPost(host, postdata, "TAG-ID-deprecate", callback, user, password);
  };

//
// rpcPost: Send a message to the RPC
//

function rpcPost(address, postdata, tagid, callback, username, passwd, content)
{
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var response = new XMLHttpRequest();
  
    /** Asynchronous event on AJAX Completion. */
    //if (callback == undefined)
    //    callback = AJAX.CALLBACK.Post;  //  <<-- Not sure if needed
  
    /** Handle the Tag ID being omitted. **/
    if (tagid == undefined)
        tagid = "";
  
    /** Establish the Callback Function. **/
    response.onreadystatechange = function() {

        if (callback != undefined)
            callback(response, address, postdata, tagid);

    };
  
    /** Generate the AJAX Request. **/
    if (username == undefined && passwd == undefined)
        response.open("POST", address, true);
    else 
        response.open("POST", address, true, username, passwd);
  
    if (content !== undefined)
        response.setRequestHeader("Content-type", content);
  
    /** Send off the Post Data. **/
    response.send(postdata);
};

class Core extends EventEmitter {

    constructor() {
        super();
    }

    get user() { return user;}
    get password() { return password;}
    get host() { return host;}
    get event() { return eventEmitter;}
    get process() { return coreprocess;}
    get isresponding() { return responding;}

    //
    // checkresponding: Check if the core is responding to incoming RPC requests
    //

    checkresponding() {

        var _this = this;

        rpcGet("getinfo", [], function(response, address, postdata) {

            if (response.readyState != 4)
                return;

            if (response.status != 200) {

                log.info("Core Manager: Waiting for core to respond for requests");
                
                setTimeout(function () {

                    _this.checkresponding();

                }, statusdelay);
            } 
            else {

                log.info("Core Manager: Core is ready for requests");

                responding = true;

                _this.emit('started');
            }
        });

        return;
    }

    //
    // start: Start up the core with necessary parameters and return the spawned process
    //

    start() {

        if (coreprocess != null)
            return;

        let settings = require("./settings").GetSettings();
        let parameters = SetCoreParameters(settings);

        if (settings.manualDaemon == true) {

            log.info("Core Manager: Manual daemon mode, skipping starting core");

        }
        else {

            if (CoreBinaryExists()) {

                log.info("Core Manager: Starting core");

                var spawn = require("child_process").spawn;

                coreprocess = spawn(GetCoreBinaryPath(), parameters, { shell: false });

                coreprocess.on('error', (err) => {

                    log.info("Core Manager: Core has returned an error: " + err);
        
                });

                if (coreprocess != null)
                    log.info("Core Manager: Core has started (process id: " + coreprocess.pid + ")");

            }
            else {

                log.info("Core Manager: Core not found, please run in manual deamon mode");

            }

        }

        this.emit('starting');

        // May not need to do this with the way we have the RPC calls set up in REACT, disable for now
        // this.checkresponding();
    }

    //
    // stop: Stop the core from running by sending SIGTERM to the process
    //

    stop(callback) {

        // if coreprocess is null we were in manual daemon mode, just exec the callback
        if (coreprocess == null) {

            if (callback)
                callback();

            return;
        }

        log.info("Core Manager: Core is stopping (process id: " + coreprocess.pid + ")");

        var _this = this;

        coreprocess.once('error', (err) => {

            log.info("Core Manager: Core has returned an error: " + err);

        });

        coreprocess.once('exit', (code, signal) => {

            log.info("Core Manager: Core has exited");

        });

        coreprocess.once('close', (code, signal) => {

            log.info("Core Manager: Core stdio streams have closed");

            //_this.removeListener('close', _this.onClose);

            coreprocess = null;
            responding = false;

            if (callback)
                callback();
        });

        coreprocess.kill();

        this.emit('stopping');
    }

    //
    // restart: Restart the core process
    //

    restart() {

        var _this = this;

        this.stop(function () {
            _this.start();
        });

    }
}

module.exports = new Core();