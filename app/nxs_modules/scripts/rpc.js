/***********************************************************
Available RPC methods:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	addmultisigaddress <nrequired> <'["key","key"]'> [account]
	backupwallet <destination>
	checkwallet
	dumpprivkey <NexusAddress>
	dumprichlist <count>
	encryptwallet <passphrase>
	exportkeys
	getaccount <Nexusaddress>
	getaccountaddress <account>
	getaddressbalance <address>
	getaddressesbyaccount <account>
	getbalance [account] [minconf=1]
	getblock <hash> [txinfo]
	getblockcount
	getblockhash <index>
	getconnectioncount
	getdifficulty
	gettransaction <txid>
	getinfo
	getmininginfo
	getmoneysupply <timestamp>
	getnetworkhashps
	getnetworkpps
	getnetworktrustkeys
	getnewaddress [account]
	getpeerinfo
	getrawtransaction <txid>
	getreceivedbyaccount <account> [minconf=1]
	getreceivedbyaddress <Nexusaddress> [minconf=1]
	getsupplyrate
	help [command]
	importkeys
	importprivkey <PrivateKey> [label]
	// keypoolrefill - most users will never need to use this. https://bitcointalk.org/index.php?topic=514644.0
	listaccounts [minconf=1]
	listreceivedbyaccount [minconf=1] [includeempty=false]
	listreceivedbyaddress [minconf=1] [includeempty=false]
	listsinceblock [blockhash] [target-confirmations]
	listtransactions [account] [count=10] [from=0]
	listNTransactions [N]
	listtrustkeys
	listunspent [minconf=1] [maxconf=9999999]  ["address",...]
	makekeypair [prefix]
	move <fromaccount> <toaccount> <amount> [minconf=1] [comment]
	repairwallet
	rescan
	reservebalance [<reserve> [amount]]
	sendfrom <fromaccount> <toNexusaddress> <amount> [minconf=1] [comment] [comment-to]
	sendmany <fromaccount> {address:amount,...} [minconf=1] [comment]
	sendrawtransaction <hex string> [checkinputs=0]
	sendtoaddress <Nexusaddress> <amount> [comment] [comment-to]
	setaccount <Nexusaddress> <account>
	settxfee <amount>
	signmessage <Nexusaddress> <message>
	stop
	unspentbalance ["address",...]
	validateaddress <Nexusaddress>
	verifymessage <Nexusaddress> <signature> <message>
**********************************************************/

/** 
	Collection of RPC calls to populate the data for the GUI.
	Add new Interface Specific Utilities Here. Module Specific Functions go In Module Scripts.
**/
export const COMMANDS = {};
export const CALLBACK = {};
import * as TYPE from 'actions/actiontypes';
import core from 'api/core';
import { LoadSettings } from 'api/settings';
// GETHOST: Get the rpc host name from the core configuration, else default to development defaults
export const GETHOST = () => {
  // let core = require("electron").remote.getGlobal("core");
  let settings = LoadSettings();
  if (settings.manualDaemon == true) {
    let savedport = core.port;
    if (settings.manualDaemonPort != undefined) {
      savedport = settings.manualDaemonPort;
    }
    let savedIP = core.ip;
    if (settings.manualDaemonIP != undefined) {
      savedIP = settings.manualDaemonIP;
    }
    return 'http://' + savedIP + ':' + savedport;
  } else {
    return core.host;
  }
};

// GETUSER: Get the rpc user name from the core configuration, else default to development defaults
export const GETUSER = () => {
  let settings = LoadSettings();
  if (settings.manualDaemon == true) {
    let saveduser =
      settings.manualDaemonUser === undefined
        ? core.user
        : settings.manualDaemonUser;

    return saveduser;
  } else {
    return core.user;
  }
};

// GETPASSWORD: Get the rpc password from the core configuration, else default to development defaults
export const GETPASSWORD = () => {
  let settings = LoadSettings();
  if (settings.manualDaemon == true) {
    let savedpassword =
      settings.manualDaemonPassword === undefined
        ? core.password
        : settings.manualDaemonPassword;

    return savedpassword;
  } else {
    return core.password;
  }
};

export const GET = (cmd, args, Callback) => {
  var PostData = JSON.stringify({
    method: cmd,
    params: args,
  });

  POST(
    GETHOST(),
    PostData,
    'TAG-ID-deprecate',
    Callback,
    GETUSER(),
    GETPASSWORD()
  );
};

export const PROMISE = (cmd, args) => {
  return new Promise((resolve, reject) => {
    var PostData = JSON.stringify({
      method: cmd,
      params: args,
    });
    var ResponseObject;

    /** Opera 8.0+, Firefox, Safari **/
    try {
      ResponseObject = new XMLHttpRequest();
    } catch (e) {
      /** Internet Explorer - All Versions **/
      try {
        ResponseObject = new ActiveXObject('Msxml2.XMLHTTP');
      } catch (e) {
        try {
          ResponseObject = new ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {
          try {
            ResponseObject = new ActiveXObject('Msxml2.XMLHTTP.6.0');
          } catch (e) {
            return false;
          }
        }
      }
    }

    /** Establish the resolve. **/
    ResponseObject.onload = () => {
      if (ResponseObject.status == 404) {
        reject('RPC Command {' + cmd + '} Not Found');
      }
      if (ResponseObject.status == 401) {
        // console.error(ResponseObject.response)
        reject('Bad Usernam and Password');
      }
      if (ResponseObject.status == 500) {
        console.log(JSON.parse(ResponseObject.responseText));
        reject(JSON.parse(ResponseObject.responseText).error.message);
      }
      if (cmd === 'validateaddress') {
        if (JSON.parse(ResponseObject.response).result.isvalid === false) {
          reject(JSON.parse(ResponseObject.response).result.isvalid);
        }
      }
      var payload;

      if (cmd === 'getaddressesbyaccount') {
        payload = {
          name: args[0],
          addresses: JSON.parse(ResponseObject.response).result,
        };
      } else {
        payload = JSON.parse(ResponseObject.response).result;
      }
      resolve(payload);
    };

    /** Generate the AJAX Request. **/
    if (GETUSER() == undefined && GETPASSWORD() == undefined)
      ResponseObject.open('POST', GETHOST(), true);
    else ResponseObject.open('POST', GETHOST(), true, GETUSER(), GETPASSWORD());

    /** Send off the Post Data. **/

    ResponseObject.onerror = function(e) {
      e.preventDefault();
      if (ResponseObject.status == 401) {
        reject(401);
      } else {
        reject(ResponseObject.responseText);
      }
    };

    ResponseObject.send(PostData);
  });
};

// export const GETWITHPASS = (cmd, args, Callback, passdata) => {
//   var PostData = JSON.stringify({
//     method: cmd,
//     params: args,
//     passthrough: passdata
//   });

//   POST(
//     GETHOST(),
//     PostData,
//     "TAG-ID-deprecate",
//     Callback,
//     GETUSER(),
//     GETPASSWORD()
//   );
// };

//TODO: clean this up... still not diving into this yet. prototype first...
export const POST = (
  Address,
  PostData,
  TagID,
  Callback,
  Username,
  Password,
  Content
) => {
  /** Object to handle the AJAX Requests. */
  var ResponseObject;

  /** Opera 8.0+, Firefox, Safari **/
  try {
    ResponseObject = new XMLHttpRequest();
  } catch (e) {
    /** Internet Explorer - All Versions **/
    try {
      ResponseObject = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
      try {
        ResponseObject = new ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        try {
          ResponseObject = new ActiveXObject('Msxml2.XMLHTTP.6.0');
        } catch (e) {
          return false;
        }
      }
    }
  }

  /** Asynchronous event on AJAX Completion. */
  if (Callback == undefined) Callback = AJAX.CALLBACK.Post;

  /** Handle the Tag ID being omitted. **/
  if (TagID == undefined) TagID = '';

  /** Establish the Callback Function. **/
  ResponseObject.onreadystatechange = () => {
    Callback(ResponseObject, Address, PostData, TagID);
  };

  /** Generate the AJAX Request. **/
  if (Username == undefined && Password == undefined)
    ResponseObject.open('POST', Address, true);
  else ResponseObject.open('POST', Address, true, Username, Password);

  if (Content !== undefined)
    ResponseObject.setRequestHeader('Content-type', Content);

  /** Send off the Post Data. **/
  ResponseObject.send(PostData);
};
