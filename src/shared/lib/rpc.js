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

import http from 'http';
import https from 'https';

import { getActiveCoreConfig } from 'lib/coreConfig';

const getDefaultOptions = ({ rpcSSL, ip, portSSL, port, user, password }) => ({
  portocol: rpcSSL ? 'https:' : 'http:',
  host: ip,
  port: rpcSSL ? portSSL : port,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: user && password ? `${user}:${password}` : undefined,
  rejectUnauthorized: false,
});

export default function rpc(cmd, args) {
  return new Promise(async (resolve, reject) => {
    try {
      const conf = await getActiveCoreConfig();
      const options = getDefaultOptions(conf);
      const params = {
        method: cmd,
        params: args,
      };
      const content = params && JSON.stringify(params);
      if (content) {
        options.headers = {
          ...options?.headers,
          'Content-Length': Buffer.byteLength(content),
        };
      }

      const { request } = conf.rpcSSL ? https : http;
      const req = request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          let result = undefined;
          if (data) {
            try {
              result = JSON.parse(data);
            } catch (err) {
              console.error('Response data is not valid JSON', data);
            }
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result?.result);
          } else {
            reject(result?.error);
          }
        });

        res.on('aborted', () => {
          reject(new Error('Aborted'));
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('abort', () => {
        reject(new Error('Aborted'));
      });

      if (params) {
        req.write(content);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}
