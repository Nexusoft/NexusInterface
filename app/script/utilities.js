/** 
	Collection of Javascript Functions for basic utilities in global Interface.
	Add new Interface Specific Utilities Here. Module Specific Functions go In Module Scripts.
	
**/

/** Declare the Namespace for the AJAX Functions. **/
var UTILITIES = UTILITIES || {};

/** 						
_____________________________________________________________________________________ 
	
	Parser Functions
_____________________________________________________________________________________ **/

/** Declare the Local Parser Namespace. **/
UTILITIES.PARSE = UTILITIES.PARSE || {};

/** Parse the Get Form from a Given URL. **/
UTILITIES.PARSE.Form = function(Address) {
  var result = [];
  Address.substr(Address.indexOf("?") + 1)
    .split("&")
    .forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });

  return result;
};

/** Parse the Get Form from a Given URL. **/
UTILITIES.PARSE.Address = function(Address) {
  if (Address.indexOf("?") == -1) return Address;

  return Address.substr(0, Address.indexOf("?"));
};

/** Parse out Invalid Characters (all but letters and numbers). **/
UTILITIES.PARSE.Invalid = function(Input) {
  return Input.replace(/([^a-z0-9]+)/gi, "");
};

/** Parse out Spaces. (remove all spaces). **/
UTILITIES.PARSE.Spaces = function(Input) {
  return Input.replace(/ /g, "");
};

/** 						
_____________________________________________________________________________________ 

	Time Functions
_____________________________________________________________________________________ **/

UTILITIES.Sleep = function(Duration) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + Duration) {}
};

/** 						
_____________________________________________________________________________________ 

	Data Type Functions
_____________________________________________________________________________________ **/

/** Find the First Key in a Given Array Object. **/
UTILITIES.First = function(Object) {
  for (var Key in Object) {
    return Key;
  }
};

var timeIndex = 0; //HELP! the problem: the time  variable is not always in the same spot in the result that comes in, we shouldn't hard code index 0 or index 1.
var accountIndex = 0;
UTILITIES.SortingCarrot = undefined;
UTILITIES.previoussortingcarrot = undefined;

UTILITIES.ADDROWSTOTABLE = function(reslist, selector, ignoreList) {
  var columns = [];

  for (let index = 0; index < 1; index++) {
    const elem = reslist[index];
    for (var key in elem) {
      if (ignoreList.indexOf(key) == -1) {
        const element = key;
        columns.push(element);
      }
    }
  }

  for (
    var i = 0;
    i < reslist.length;
    i++ // row loop
  ) {
    var row = document.createElement("tr");
    row.id = reslist[i][columns[accountIndex]] + reslist[i][columns[timeIndex]];
    row.setAttribute("oncontextmenu", "Hover(true)");
    row.setAttribute("onmouseover", "SetID(" + i + ")");
    for (var ci = 0; ci < columns.length; ci++) {
      // col loop
      var cell = reslist[i][columns[ci]];
      if (cell == null) {
        cell = "";
      }

      // if(columns[ci] == "txid") {
      // 	RPC.Get()
      // }
      var col = document.createElement("td");
      col.id = row.id + "-" + columns[ci];
      col.innerHTML = cell;

      //I am setting up custom params for some rows but I think this might not be a good way to do this.
      if (columns[ci] == "coin") {
        col.innerHTML =
          '<a href="https://www.w3schools.com/html/"  >' + cell + "</a>";
      }
      if (columns[ci] == "USDValue") {
        col.innerHTML = '<p id="' + row.id + '-USD">0</p>';
      }
      if (columns[ci] == "BTCValue") {
        col.innerHTML = '<p id="' + row.id + '-BTC">0</p>';
      }
      row.appendChild(col);
    }

    selector.appendChild(row);
  }
};

UTILITIES.BUILDHTMLTABLE = function(reslist, selector, ignoreList) {
  var columns = UTILITIES.ADDALLCOLTHANDRETURNCOLHEADERS(
    reslist,
    selector,
    ignoreList
  );

  for (
    var i = 0;
    i < reslist.length;
    i++ // row loop
  ) {
    var row = document.createElement("tr");
    row.id = reslist[i][columns[accountIndex]] + reslist[i][columns[timeIndex]];
    row.setAttribute("oncontextmenu", "Hover(true)");
    row.setAttribute("onmouseover", "SetID(" + i + ")");
    for (var ci = 0; ci < columns.length; ci++) {
      // col loop
      var cell = reslist[i][columns[ci]];
      if (cell == null) {
        cell = "";
      }

      // if(columns[ci] == "txid") {
      // 	RPC.Get()
      // }
      var col = document.createElement("td");
      col.id = row.id + "-" + columns[ci];
      col.innerHTML = cell;

      //I am setting up custom params for some rows but I think this might not be a good way to do this.
      if (columns[ci] == "coin") {
        col.innerHTML =
          '<a href="https://www.w3schools.com/html/"  >' + cell + "</a>";
      }
      if (columns[ci] == "USDValue") {
        col.innerHTML = '<p id="' + row.id + '-USD">0</p>';
      }
      if (columns[ci] == "BTCValue") {
        col.innerHTML = '<p id="' + row.id + '-BTC">0</p>';
      }
      row.appendChild(col);
    }

    selector.appendChild(row);
  }
};
UTILITIES.ADDALLCOLTHANDRETURNCOLHEADERS = function(
  reslist,
  selector,
  ignoreList
) {
  var columnSet = [];
  var headerTrs;
  if (document.getElementById(selector.id + "-header") == null) {
    headerTrs = document.createElement("tr");
    headerTrs.id = selector.id + "-header";
  } else {
    headerTrs = document.getElementById(selector.id + "-header");
    // headerTrs.innerHTML = "";
  }

  for (var i = 0; i < reslist.length; i++) {
    // row loop
    var rowHash = reslist[i];

    for (var key in rowHash) {
      // col loop
      // if(key != "account" && key != "blockhash") {

      // for(var j = 0; j < ignoreList.length; j++) {
      // 	if (key != ignoreList[j]) {
      if (ignoreList.indexOf(key) == -1) {
        if (columnSet.indexOf(key) == -1) {
          columnSet.push(key);
          if (key === "txid") {
            timeIndex = columnSet.length - 1;
          }
          if (key === "account") {
            accountIndex = columnSet.length - 1;
          }

          if (document.getElementById(selector.id + "-" + key) == null) {
            var header = document.createElement("th");
            header.id = selector.id + "-" + key;
            header.innerHTML = "<h>" + key + "</h>";
            // header.attributes.id

            //Create the carrot 
            if ( UTILITIES.SortingCarrot == undefined)
            {
               UTILITIES.SortingCarrot = document.createElement("img");
               UTILITIES.SortingCarrot.src = "images/FilterCarrot.png";
               UTILITIES.SortingCarrot.style.display = "none";
               UTILITIES.SortingCarrot.style.width = "20px";
               UTILITIES.SortingCarrot.style.heigth = "20px";
            }
            header.childNodes[0].appendChild(UTILITIES.SortingCarrot.cloneNode(true)); //Add a clone to it under the column label
            headerTrs.appendChild(header);
            var count = headerTrs.childNodes.length;
            var hind = 0;
            var tmp = header;
            while ((tmp = tmp.previousSibling) != null) hind++;
            header.setAttribute(
              "onclick",
              "UTILITIES.sortTabel(" + hind + ', "' + selector.id + '");'
            );
          }
        }
      }
      // }
      // }
    }
  }
  selector.appendChild(headerTrs);
  // $(selector).append(headerTr$);

  return columnSet;
};

UTILITIES.sortTabel = function(columnN, tablename) {
  var table = document.getElementById(tablename);
  var rows,
    switching,
    i,
    x,
    y,
    shouldSwitch,
    dir,
    switchcount = 0;
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc";
  let headersdiv = document.getElementById("nxs-transaction-table-header");
  let lablediv = headersdiv.childNodes[columnN].childNodes[0]; //Get the text lable under the header
  if ( UTILITIES.previoussortingcarrot != undefined)
  {
    //Turn off the old one
    UTILITIES.previoussortingcarrot.style.display = "none";
    UTILITIES.previoussortingcarrot.style.transform = "";
  }
  UTILITIES.previoussortingcarrot = lablediv.childNodes[1];
  UTILITIES.previoussortingcarrot.style.display = "inline";

  /*Make a loop that will continue until
	no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
		first, which contains table headers):*/
    for (i = 1; i < rows.length - 1; i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
			one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[columnN];
      y = rows[i + 1].getElementsByTagName("TD")[columnN];
      /*check if the two rows should switch place,
			based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
			and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount++;
    } else {
      /*If no switching has been done AND the direction is "asc",
			set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
    //This sets the transform of the sorting carrot
    if ( dir == "desc"){
      UTILITIES.previoussortingcarrot.style.transform = "scaleY(-1)";
    }
  }
};

UTILITIES.IconBarHandler = results => {
  if (results.unlocked_until === undefined) {
    document.getElementById("lockIcon").src = "images/unencryptedicon.png";
    document.getElementById("security").innerText = "Wallet Unencrypted";
  } else if (results.unlocked_until === 0) {
    document.getElementById("lockIcon").src = "images/lock.png";
    document.getElementById("security").innerText = "Wallet Locked";
  } else if (results.unlocked_until >= 0) {
    document.getElementById("lockIcon").src = "images/unlock.png";
    document.getElementById("security").innerText = "Wallet Unlocked";
  }

  document.getElementById("stakeWeight").innerText = `Stake Weight: ${
    results.stakeweight
  }%`;
  document.getElementById("trustWeight").innerText = `Trust Weight: ${
    results.trustweight
  }%`;
  document.getElementById("IntrestRate").innerText = `Intrest Rate: ${
    results.interestweight
  }%`;
  document.getElementById("blockWeight").innerText = `Block Weight: ${
    results.blockweight
  }`;
};
