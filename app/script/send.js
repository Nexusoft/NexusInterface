var SENDRECEIVE = SENDRECEIVE || {};
// SENDRECEIVE.QRCode = SENDRECEIVE.QRCode || require('qrcode');
SENDRECEIVE.clipboard = SENDRECEIVE.clipboard || require('electron').clipboard;
SENDRECEIVE.request = SENDRECEIVE.request || require("request");

// let interator = 1;

/* Define callback object */
SENDRECEIVE.CALLBACK = SENDRECEIVE.CALLBACK || {};

SENDRECEIVE.Analytics = require("./script/googleanalytics.js");

SENDRECEIVE.addToQueue = function() {
	let address = document.getElementById('nxs-address');
	let account = document.getElementById('nxs-account');
	let amount = document.getElementById('nxs-send-amount');
	let message = document.getElementById('nxs-send-message');
	var row = document.createElement('tr');
	row.classList += "send-queue-element";
	var tdaddress = document.createElement('td');
	var tdacc = document.createElement('td');
	var tdamount = document.createElement('td');
	var tdremove = document.createElement('td');
	var tdremovebtn = document.createElement('input');
	tdremovebtn.type = "button";
	tdremovebtn.onclick = function() {
		var td = this.parentElement;
		var delrow = td.parentElement;
		var table = delrow.parentElement;
		table.removeChild(delrow);
		RPC.GET('getinfo', [], SENDRECEIVE.getinfo); 
	};
	tdremove.appendChild(tdremovebtn);
	tdamount.classList += "send-queue-amount";
	tdaddress.innerHTML = address.value;
	tdacc.innerHTML = account.value;
	tdamount.innerHTML = amount.value;
	row.id = address.value;
	row.appendChild(tdacc);
	row.appendChild(tdaddress);
	row.appendChild(tdamount);
	row.appendChild(tdremove);
	document.getElementById('send-queue-table').appendChild(row);
	address.value = "";
	account.value = "";
	account.setAttribute('placeholder', 'NXS Account')
	amount.value = "";
	message.value = "";
	RPC.GET('getinfo', [], SENDRECEIVE.getinfo); 
};

SENDRECEIVE.paste = function () {
	document.getElementById('nxs-address').value = SENDRECEIVE.clipboard.readText();
	SENDRECEIVE.validateAddress();
};
SENDRECEIVE.validateAddress = function() {
	let address = document.getElementById('nxs-address');
	RPC.GET('validateaddress', [address.value], SENDRECEIVE.CALLBACK.validateaddress);
};
SENDRECEIVE.CALLBACK.validateaddress = function(ResponseObject, Address, PostData) {
	/** Skip Ready States until AJAX Finishes Loading.. **/
	if (ResponseObject.readyState != 4) return;
  
	/** Register the Content to this Current Frame Body. **/
	if (ResponseObject.status == 200) {
	  var Data = JSON.parse(ResponseObject.responseText);
	  var results = Data.result;
	  // results.account = results.account || "";
	  var address = document.getElementById('nxs-address');
	  var validAddress = document.getElementById('nxs-valid-address');
	  if(results.isvalid) {
			SENDRECEIVE.Analytics.GANALYTICS.SendEvent("SendReceive","Send","Sent",1);
			if(!results.ismine) 
			{
				validAddress.setAttribute('src', 'images/save.png');
			}

			// only do the account stuff if its valid...
			var account = document.getElementById('nxs-account');
			if(results.account !== "") {
				//   account.value = results.account;
				// account.setAttribute('value', results.account);
				account.value = results.account;
				account.setAttribute('placeholder', 'Currently: ' + results.account);
				// account.addEventListener('onfocusout', );
				document.getElementById('nxs-valid-account').setAttribute('src', 'images/save.png');
			}
			else {
				account.setAttribute('placeholder', 'Save As Account');
			}
	  }
	  else {
		validAddress.setAttribute('src', 'images/nxs-wrong.png');		
	  }
	  
	} else {
  
	  // RPC method error.
	}
};
SENDRECEIVE.changeAccountName = function() {
	var nxsaddress = document.getElementById('nxs-address');
	var nxsaccount = document.getElementById('nxs-account');

  RPC.PROMISE('setaccount', [nxsaddress.value, nxsaccount.value]).then(payload => {
		console.log('Changed associated account name.')
		SENDRECEIVE.validateAddress();
	});
};
SENDRECEIVE.getinfo = function(ResponseObject, Address, PostData) {
		/** Skip Ready States until AJAX Finishes Loading.. **/
		if (ResponseObject.readyState != 4) return;
		
		/** Register the Content to this Current Frame Body. **/
		if (ResponseObject.status == 200) {
			var Data = JSON.parse(ResponseObject.responseText);
			var results = Data.result;
			var nxsbalance = document.getElementById('nxs-getinfo-balance');
			nxsbalance.innerHTML = results.balance.toFixed(6);
			console.log(nxsbalance.value);
			// var sendqueue = document.getElementById('send-queue-table');
			var queued = document.getElementsByClassName('send-queue-amount');
			var remaining = document.getElementById('nxs-getinfo-remaining-balance');
			var remtot = 0.0;
			for(var i =0; i < queued.length; i++)
			{
				remtot += parseFloat(queued.item(i).innerHTML);
			}
			remaining.innerHTML = (results.balance - remtot).toFixed(6); 

			console.log(results);
		}
};
SENDRECEIVE.sendnow = function () {
	var address = document.getElementById('nxs-address');
	var amount = document.getElementById('nxs-send-amount');
	var message = document.getElementById('nxs-send-message');
	var bal = document.getElementById('nxs-getinfo-balance');
	if(amount.value > parseFloat(bal.innerText))
	{
		// Yell about not having nxs!
		console.log("You don't have enough Nexus to perform this action");
	}
	else {
		console.log(address.value, amount.value, message.value);
		RPC.PROMISE('sendtoaddress', [address.value, parseFloat(amount.value).toFixed(6), message.value]).then(payload => {
			console.log('You sent a transaction:', payload );
		});
	}
}
/** Declare the MODULE AJAX Callback Function. 
	This function is Registered in the Database and Executed when Module is Loaded. **/
AJAX.CALLBACK.MODULE.Final = function(ResponseObject, Address, TagID) {
	SENDRECEIVE.nxsaddress = document.getElementById("nxs-address");
	SENDRECEIVE.nxsaccount = document.getElementById("nxs-account");
	SENDRECEIVE.nxssendammount = document.getElementById("nxs-send-amount");
	if ( typeof TRANSACTIONS !== "undefined") //Have you ever been to the transaction Page 
	{ 
		if(SENDRECEIVE.nxsaccount.value )
			if ( typeof TRANSACTIONS.resendtransaction.address !== "undefined") 
			{ 
			
				console.log(TRANSACTIONS.resendtransaction); 
				SENDRECEIVE.nxsaddress.value = TRANSACTIONS.resendtransaction.address; 
				SENDRECEIVE.nxsaccount.value = TRANSACTIONS.resendtransaction.account; 
				SENDRECEIVE.nxssendammount.value = TRANSACTIONS.resendtransaction.amount; 
				TRANSACTIONS.resendtransaction = undefined; // the action has been spent, remove it 
				SENDRECEIVE.addToQueue();
			}
				
	}
	RPC.GET('getinfo', [], SENDRECEIVE.getinfo); 
};
