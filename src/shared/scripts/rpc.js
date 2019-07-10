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

import { LoadSettings } from 'lib/settings';
import { customConfig } from 'lib/coreConfig';

// export const GET = (cmd, args, Callback) => {
//   var PostData = JSON.stringify({
//     method: cmd,
//     params: args,
//   });

//   POST(
//     GETHOST(),
//     PostData,
//     'TAG-ID-deprecate',
//     Callback,
//     GETUSER(),
//     GETPASSWORD()
//   );
// };

export const PROMISE = (cmd, args) => {
  return new Promise((resolve, reject) => {
    var PostData = JSON.stringify({
      method: cmd,
      params: args,
    });
    //console.log(cmd, args); // keep here for debugging
    var ResponseObject;
    // console.log(PostData);
    // console.log(GETUSER(), GETPASSWORD());

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
        // console.error(ResponseObject);
        reject('Bad Username and Password');
      }
      if (ResponseObject.status == 400) {
        // console.error(ResponseObject);
        reject('Bad Request');
      }
      if (ResponseObject.status == 500) {
        // console.log(JSON.parse(ResponseObject.responseText));
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
    const settings = LoadSettings();
    const conf = customConfig(
      settings.manualDaemon
        ? {
            ip: settings.manualDaemonIP,
            port: settings.manualDaemonPort,
            user: settings.manualDaemonUser,
            password: settings.manualDaemonPassword,
            dataDir: settings.manualDaemonDataDir,
          }
        : {}
    );
    //
    /** Generate the AJAX Request. **/
    if (!conf.user && !conf.password)
      ResponseObject.open('POST', conf.host, true);
    else ResponseObject.open('POST', conf.host, true, conf.user, conf.password);
    // console.log(ResponseObject);
    /** Send off the Post Data. **/
    ResponseObject.withCredentials = true;
    ResponseObject.setRequestHeader(
      'Authorization',
      'Basic ' + btoa(conf.user + ':' + conf.password)
    );

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

//TODO: clean this up... still not diving into this yet. prototype first...
// export const POST = (
//   Address,
//   PostData,
//   TagID,
//   Callback,
//   Username,
//   Password,
//   Content
// ) => {
//   /** Object to handle the AJAX Requests. */
//   var ResponseObject;

//   /** Opera 8.0+, Firefox, Safari **/
//   try {
//     ResponseObject = new XMLHttpRequest();
//   } catch (e) {
//     /** Internet Explorer - All Versions **/
//     try {
//       ResponseObject = new ActiveXObject('Msxml2.XMLHTTP');
//     } catch (e) {
//       try {
//         ResponseObject = new ActiveXObject('Microsoft.XMLHTTP');
//       } catch (e) {
//         try {
//           ResponseObject = new ActiveXObject('Msxml2.XMLHTTP.6.0');
//         } catch (e) {
//           return false;
//         }
//       }
//     }
//   }

//   /** Asynchronous event on AJAX Completion. */
//   if (Callback == undefined) Callback = AJAX.CALLBACK.Post;

//   /** Handle the Tag ID being omitted. **/
//   if (TagID == undefined) TagID = '';

//   /** Establish the Callback Function. **/
//   ResponseObject.onreadystatechange = () => {
//     Callback(ResponseObject, Address, PostData, TagID);
//   };

//   /** Generate the AJAX Request. **/
//   if (Username == undefined && Password == undefined)
//     ResponseObject.open('POST', Address, true);
//   else ResponseObject.open('POST', Address, true, Username, Password);

//   if (Content !== undefined)
//     ResponseObject.setRequestHeader('Content-type', Content);

//   /** Send off the Post Data. **/
//   ResponseObject.send(PostData);
// };
