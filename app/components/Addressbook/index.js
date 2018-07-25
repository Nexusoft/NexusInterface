import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import { remote } from "electron";
import config from "./api/configuration.js";
import * as RPC from "../../script/rpc";

import ContextMenuBuilder from "../../contextmenu";
// import { contexttemplate } from "./menu/contextmenu";


// ADDRESSBOOK.fs = ADDRESSBOOK.fs || require("fs");
// ADDRESSBOOK.Menu = ADDRESSBOOK.Menu || require("electron").remote.Menu;
// ADDRESSBOOK.MenuItem = ADDRESSBOOK.MenuItem || require("electron").remote.MenuItem;
// ADDRESSBOOK.context = ADDRESSBOOK.context || require("./menu/contextmenu");
// ADDRESSBOOK.contexttemplate = ADDRESSBOOK.contexttemplate || require("./menu/contextmenu").contexttemplate;

// ADDRESSBOOK.CALLBACK = ADDRESSBOOK.CALLBACK || {};
// ADDRESSBOOK.ACCOUNTS = ADDRESSBOOK.ACCOUNTS || [];

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});

class Addressbook extends Component {

  static contextTypes = {
    router: React.PropTypes.object
  };

  constructor(props)
  {
    super(props);

    this.state =
    {
      addresscountnotmine: 0,
      addresscountmine: 0,
      accountsTotal: 0,
      accountsaddressed: 0,
      thisadd: "",
      thisid: "",
      rootAccount: "",
      autofill: "",
      addId: "",
      pages: {},
      thisPage: 1,
      maxPage: 1,
      hoveredover: false,
      today: new Date(),
      SendOBJ: {
        name: "",
        to: ""
      },
      calledfrom: false,
      psudoState: null,
      generateFlag: false

    };
  }

  componentDidMount() {

    this.addressbookcontextfunction = this.addressbookcontextfunction.bind(this);

    window.addEventListener("contextmenu", this.addressbookcontextfunction, false);

    // CODE FROM TRANSACTIONS (FOR REFERENCE)
    // if (this.state.exectuedHistoryData == false)
    // {
    //   this.gethistorydatajson();
    //   this.setState(
    //     {
    //       exectuedHistoryData:true
    //     }
    //   );
    // }
    
  }

  componentWillUnmount()
  {
    window.removeEventListener("contextmenu",this.addressbookcontextfunction);
  }

  //Make the function to attached to the listener
  addressbookcontextfunction(e) 
  {
    // Prevent default action of right click
    e.preventDefault();

    const template = [
      {
        label: 'File',
        submenu: [
    
          {
            label: 'Copy',
            role: 'copy',
            
          }
        ]
      },
      {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
      }
    ]

    //get default context menu
    const defaultContext = new ContextMenuBuilder().defaultContext;

    //build default context menu
    let defaultcontextmenu = remote.Menu.buildFromTemplate(defaultContext);

    //create new custom context menu
    let addressbookcontextmenu = new remote.Menu();

    //Add Resending the transaction option
    addressbookcontextmenu.append(
      new remote.MenuItem({
        label: "Send Nexus To",
        click() {
          alert("Send Nexus: not yet implemented");
          // ADDRESSBOOK.SendOBJ = Object.assign(ADDRESSBOOK.SendOBJ, {
          //   to: ADDRESSBOOK.thisadd
          // });
          // alert(ADDRESSBOOK.SendOBJ);
          // ADDRESSBOOK.calledfrom = true;
          // LOAD.Module(1, 2);
        }
      })
    );

    let addressbooklabelcontextmenu = new remote.Menu();

    //Add Resending the transaction option
    addressbooklabelcontextmenu.append(
      new remote.MenuItem({
        label: "Edit",
        click() {
          alert("Edit Modal: not yet implemented");
          // ADDRESSBOOK.labelmodal(ADDRESSBOOK.thisid, ADDRESSBOOK.autofill);
        }
      })
    );

    switch (this.state.hoveredover) {
      case "label":
        addressbooklabelcontextmenu.popup(remote.getCurrentWindow());
        break;
      case "outgoing":
        addressbookcontextmenu.popup(remote.getCurrentWindow());
        break;
      case "general":
        defaultcontextmenu.popup(remote.getCurrentWindow());
        break;
      default:
        defaultcontextmenu.popup(remote.getCurrentWindow());
        break;
    }
  }

  /// CALLBACK.setaccount
  /// handles inputing a newly created account's details into the psudoState object then calls the refresh method
  /// Input:
  ///     ResponseObject || Object || used only to determine the readystate of the request
  ///     Address || string || not used
  ///     PostData || object || not used

  setaccount(newName, areaCode, first3, last4, TZ, newNotes, modal)
  {
    this.state.psudoState[newName] = {
      mine: {},
      notMine: {}
    };
    let concat = areaCode + first3 + last4;

    if (concat.trim().length >= 10) {
      this.state.psudoState = Object.assign(this.state.psudoState, {
        [newName]: Object.assign(this.state.psudoState[newName], {
          phoneNum: `(${areaCode}) ${first3}-${last4}`
        })
      });
    }

    if (TZ !== null || undefined || "") {
      this.state.psudoState = Object.assign(this.state.psudoState, {
        [newName]: Object.assign(this.state.psudoState[newName], {
          timeZone: TZ
        })
      });
    }

    if (newNotes.trim() !== "") {
      this.state.psudoState = Object.assign(this.state.psudoState, {
        [newName]: Object.assign(this.state.psudoState[newName], {
          notes: newNotes
        })
      });
    }
    console.log(this.state.psudoState);
    config.WriteJson("addressbook.json", this.state.psudoState);
    modal.close();

    RPC.GET("listaccounts", [0], ADDRESSBOOK.CALLBACK.REFRESH);
  }

  /// CALLBACK.REFRESH
  /// takes in the return from the rpc command listaccounts updates the psudoState, records the psudostate in JSON storage,
  /// andthen calls PROCESSACCOUNTS
  /// Input:
  ///     ResponseObject || Object || result is used to kick off a chain of promises that retrieves the rest of the
  ///                                 information that pertains to the addressbok
  ///     Address || string || not used
  ///     PostData || object || not used

  ADDRESSBOOK.CALLBACK.REFRESH = (ResponseObject, Address, PostData) => 
  {
    if (ResponseObject.readyState != 4) return;

    if (ResponseObject.status == 200) {
      this.state.psudoState = config.ReadJson("addressbook.json");
      var Data = JSON.parse(ResponseObject.responseText);
      var results = Data.result;

      let accounts = Object.keys(results);

      let promises = [];
      let addressCheck = [];
      for (let i = 0; i < accounts.length; i++) {
        promises.push(RPC.PROMISE("getaddressesbyaccount", [accounts[i]]));
      }
      Promise.all(promises).then(payload => {
        payload.map(element => {
          element.addresses.map(address => {
            addressCheck.push(RPC.PROMISE("validateaddress", [address]));
          });
        });

        Promise.all(addressCheck).then(payload => {
          payload.map((e, i) => {
            if (e.ismine) {
              if (!this.state.psudoState[e.account]) {
                this.state.psudoState[e.account] = {
                  numAddreses: 0,
                  mine: {},
                  notMine: {},
                  phoneNum: this.state.psudoState[e.account].phoneNum,
                  timeZone: this.state.psudoState[e.account].timeZone,
                  notes: this.state.psudoState[e.account].notes
                };
              }
              if (e.isvalid) {
                if (
                  this.state.psudoState[e.account] ||
                  this.state.psudoState[e.account] === ""
                ) {
                  if (
                    !Object.values(
                      this.state.psudoState[e.account].mine
                    ).includes(e.address)
                  ) {
                    this.state.psudoState[e.account].numAddreses++;
                    this.state.psudoState[e.account].mine = Object.assign(
                      this.state.psudoState[e.account].mine,
                      { [i]: e.address }
                    );
                  }
                }
              }
            } else {
              if (!this.state.psudoState[e.account]) {
                this.state.psudoState[e.account] = {
                  numAddreses: 0,
                  mine: {},
                  notMine: {},
                  phoneNum: this.state.psudoState[e.account].phoneNum,
                  timeZone: this.state.psudoState[e.account].timeZone,
                  notes: this.state.psudoState[e.account].notes
                };
              }
              if (e.isvalid) {
                if (
                  this.state.psudoState[e.account] ||
                  this.state.psudoState[e.account] === ""
                ) {
                  if (
                    !Object.values(
                      this.state.psudoState[e.account].notMine
                    ).includes(e.address)
                  ) {
                    this.state.psudoState[e.account].numAddreses++;
                    this.state.psudoState[e.account].notMine = Object.assign(
                      this.state.psudoState[e.account].notMine,
                      { [i]: e.address }
                    );
                  }
                }
              }
            }
          });

          config.WriteJson(
            "addressbook.json",
            this.state.psudoState
          );

          ADDRESSBOOK.PROCESSACCOUNTS();
        });
      });
    }
  }

  /// CALLBACK.REFRESH
  /// takes in the return from the rpc command listaccounts initializes the psudoState, records the psudostate in JSON storage,
  /// and then calls PROCESSACCOUNTS which builds the page for the first time
  /// Input:
  ///     ResponseObject || Object || result is used to kick off a chain of promises that retrieves the rest of the
  ///                                 information that pertains to the addressbok
  ///     Address || string || not used
  ///     PostData || object || not used

  ADDRESSBOOK.CALLBACK.LOADDATA = (ResponseObject, Address, PostData) => 
  {
    if (ResponseObject.readyState != 4) return;

    if (ResponseObject.status == 200) {
      // check to see if the JSON storage exists if not create it
      try {
        this.state.psudoState = config.ReadJson("addressbook.json");
      } catch (err) {
        config.WriteJson("addressbook.json", {});
      }
      let Data = JSON.parse(ResponseObject.responseText);
      let results = Data.result;

      let accounts = Object.keys(results);
      if (this.state.psudoState === null) {
        this.state.psudoState = Object.assign({}, results);
      }
      let promises = [];
      let addressCheck = [];
      for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];
        promises.push(RPC.PROMISE("getaddressesbyaccount", [accounts[i]]));
      }

      Promise.all(promises).then(payload => {
        payload.map(element => {
          element.addresses.map(address => {
            addressCheck.push(RPC.PROMISE("validateaddress", [address]));
          });
        });

        Promise.all(addressCheck).then(payload => {
          payload.map((e, i) => {
            if (e.ismine) {
              if (typeof this.state.psudoState[e.account] !== "object") {
                this.state.psudoState[e.account] = {
                  numAddreses: 0,
                  mine: {},
                  notMine: {},
                  phoneNum: "No Phone Number Set",
                  timeZone: "No Time Zone Set",
                  notes: "No Notes"
                };
              }
              if (e.isvalid) {
                if (
                  this.state.psudoState[e.account] ||
                  this.state.psudoState[e.account] === ""
                ) {
                  if (
                    !Object.values(
                      this.state.psudoState[e.account].mine
                    ).includes(e.address)
                  ) {
                    this.state.psudoState[e.account].numAddreses++;
                    this.state.psudoState[e.account].mine = Object.assign(
                      this.state.psudoState[e.account].mine,
                      { [i]: e.address }
                    );
                  }
                }
              }
            } else {
              if (typeof this.state.psudoState[e.account] !== "object") {
                this.state.psudoState[e.account] = {
                  numAddreses: 0,
                  mine: {},
                  notMine: {},
                  phoneNum: "No Phone Number Set",
                  timeZone: "No Time Zone Set",
                  notes: "No Notes"
                };
              }
              if (e.isvalid) {
                if (
                  this.state.psudoState[e.account] ||
                  this.state.psudoState[e.account] === ""
                ) {
                  if (
                    !Object.values(
                      this.state.psudoState[e.account].notMine
                    ).includes(e.address)
                  ) {
                    this.state.psudoState[e.account].numAddreses++;
                    this.state.psudoState[e.account].notMine = Object.assign(
                      this.state.psudoState[e.account].notMine,
                      { [i]: e.address }
                    );
                  }
                }
              }
            }
          });
          config.WriteJson(
            "addressbook.json",
            this.state.psudoState
          );
          console.log(this.state.psudoState);
          ADDRESSBOOK.PROCESSACCOUNTS();
        });
      });
    }
  }

  /// HANDLEHIGHLIGHTS
  /// dynamically highlights the letters on the side of the addresses
  /// Input:
  ///     letters || Array || result is used to kick off a chain of promises that retrieves the rest of the
  ///                                 information that pertains to the addressbok
  ///     namesList || string || passed to check in view

  ADDRESSBOOK.HANDLEHIGHLIGHTS = (letters, namesList) => 
  {
    let highlight = letters.map(i => {
      let element = document.getElementById(`${i}`);

      let bool = ADDRESSBOOK.CHECKINVIEW(namesList, element);
      return bool;
    });
    highlight.map((e, i) => {
      if (e) {
        let higlighter = document.getElementById(`${letters[i]}navLetter`);
        higlighter.className = "navLetterHighlight";
      } else if (!e) {
        let higlighter = document.getElementById(`${letters[i]}navLetter`);
        higlighter.className = "navLetter";
      }
    });
  }

  /// CHECKINVIEW
  /// Checks to see which accounts are in the view
  /// Input:
  ///     container || Array || list of the names of the accounts to be checked for
  ///     element || HTML element || the element to locate
  /// Output :
  ///     Boolian || weather or not the element is in the view

  ADDRESSBOOK.CHECKINVIEW = (container, element, partial) => 
  {
    //Get container properties
    let cTop = container.scrollTop;
    let cBottom = cTop + container.clientHeight;

    //Get element properties
    let eTop = element.offsetTop;
    let eBottom = eTop + element.clientHeight;

    //Check if in view
    let isTotal = eTop >= cTop && eBottom <= cBottom;
    let isPartial =
      partial &&
      ((eTop < cTop && eBottom > cTop) || (eBottom > cBottom && eTop < cBottom));

    //Return outcome
    return isTotal || isPartial;
  }

  /// PROCESSACCOUNTS
  /// This method starts the pagebuilding process by populating the list of accounts on the side and calling contactdetailer when done

  ADDRESSBOOK.PROCESSACCOUNTS = () => 
  {
    AJAX.LOADER.Hide();
    const master = this.state.psudoState;
    const masterArr = Object.keys(master);
    const regexp = /^[A-Z]/;
    const accountDisplayDiv = document.getElementById("nxs-address-display");
    accountDisplayDiv.innerHTML = "";
    const namesContainer = document.createElement("div");
    namesContainer.id = "namesContainer";

    const namesList = document.createElement("div");
    namesList.id = "namesList";
    namesList.addEventListener("scroll", () => {
      ADDRESSBOOK.HANDLEHIGHLIGHTS(letters, namesList);
    });
    const namesDivs = masterArr.map(name => {
      const contactName = document.createElement("div");
      if (name === "") {
        contactName.innerText = "No Account Set";
        contactName.id = "No Account Set";
        contactName.addEventListener("click", () => {
          ADDRESSBOOK.CONTACTDETAILER(
            accountDisplayDiv,
            name,
            this.state.psudoState[name].phoneNum,
            this.state.psudoState[name].timeZone,
            this.state.psudoState[name].notes,
            true
          );
        });
      } else {
        if (regexp.test(name)) {
          contactName.innerText = name;
          contactName.id = name;
          contactName.addEventListener("click", () => {
            ADDRESSBOOK.CONTACTDETAILER(
              accountDisplayDiv,
              name,
              this.state.psudoState[name].phoneNum,
              this.state.psudoState[name].timeZone,
              this.state.psudoState[name].notes,
              true
            );
          });
        } else {
          contactName.id = name;

          contactName.addEventListener("click", () => {
            ADDRESSBOOK.CONTACTDETAILER(
              accountDisplayDiv,
              name,
              this.state.psudoState[name].phoneNum,
              this.state.psudoState[name].timeZone,
              this.state.psudoState[name].notes,
              true
            );
          });
          let upperName = name.slice(0, 1).toUpperCase() + name.slice(1);

          contactName.innerText = upperName;
        }
      }

      contactName.className = "name";
      contactName.value = name;
      return contactName;
    });
    let letters = [];
    let prevVal = "";

    namesDivs.sort((a, b) => {
      let aId = a.id.toUpperCase();
      let bId = b.id.toUpperCase();
      if (aId < bId) {
        return -1;
      }
      if (aId > bId) {
        return 1;
      }

      return 0;
    });

    namesDivs.map(div => {
      if (div.innerText[0] !== prevVal[0]) {
        const letterheader = document.createElement("div");
        letterheader.className = "letterheader";
        if (div.value === "") {
          letterheader.innerText = "No Account Set";
          letterheader.id = "N/A";
          letters.push("N/A");
        } else {
          letterheader.innerText = div.value[0].toUpperCase();
          letterheader.id = div.value[0].toUpperCase();
          letters.push(div.value[0].toUpperCase());
        }

        namesList.appendChild(letterheader);
        namesList.appendChild(div);
      } else {
        namesList.appendChild(div);
      }
      prevVal = div.innerText;
    });
    namesContainer.appendChild(namesList);
    const navLetters = document.createElement("div");
    navLetters.id = "navLetters";

    letters = letters.sort();

    letters.map(L => {
      if (L == "" || L == undefined) {
        L = "N/A";
      }

      const navLetter = document.createElement("a");

      navLetter.className = "navLetter";
      navLetter.id = `${L}navLetter`;
      navLetter.innerText = L.toUpperCase();
      navLetter.href = `#${L.toUpperCase()}`;
      navLetters.appendChild(navLetter);
    });

    namesContainer.appendChild(navLetters);
    accountDisplayDiv.appendChild(namesContainer);
    if (namesDivs[0].id === "No Account Set") {
      ADDRESSBOOK.CONTACTDETAILER(
        accountDisplayDiv,
        "",
        this.state.psudoState[""].phoneNum,
        this.state.psudoState[""].timeZone,
        this.state.psudoState[""].notes
      );
    } else {
      ADDRESSBOOK.CONTACTDETAILER(
        accountDisplayDiv,
        namesDivs[0].id,
        this.state.psudoState[namesDivs[0].id].phoneNum,
        this.state.psudoState[namesDivs[0].id].timeZone,
        this.state.psudoState[namesDivs[0].id].notes
      );
    }
    ADDRESSBOOK.HANDLEHIGHLIGHTS(letters, namesList);
  }

  /// COPYADDRESS
  /// finds the required address and then creates an input -> populates it -> focus on it-> selects -> copy to clipboard -> removes it
  /// Input
  ///     inc || number || a number corisponding to the id of the addresses element

  ADDRESSBOOK.COPYADDRESS = function(inc) 
  {
    let flash = document.getElementById("nxs-addressbook-module");
    let lookup = `m${inc}`;
    let getAdd = document.getElementById(lookup);
    let TA = document.createElement("input");
    TA.type = "text";
    flash.appendChild(TA);
    TA.value = getAdd.innerText;
    TA.focus();
    TA.select();
    document.execCommand("Copy", false, null);
    TA.remove();
    alert("Address Copied");
  }

  /// CONTACTDETAILER
  /// takes in relevent information and builds elements to display the contacts information
  /// Input:
  ///      accountDisplayDiv || HTML element || mounting point for the elemnets to be created
  ///      name || string || account name
  ///      phone || string || phone mumber
  ///      timeZone || number or string || diffrence in min from GMT to calculate the time in that timezone
  ///      notes || string || notes
  ///      notFirst || Boolian || weather or not to destroy the old elements and redraw

  ADDRESSBOOK.CONTACTDETAILER = function(accountDisplayDiv, name, phone, timeZone, notes, notFirst) 
  {
    if (notFirst) {
      let oldCard = document.getElementById("contactDetail");
      oldCard.remove();
    }

    const contactDetailContainer = document.createElement("div");
    contactDetailContainer.id = "contactDetail";

    const contactCard = document.createElement("div");
    contactCard.id = "contactCard";

    const profilePic = document.createElement("img");
    profilePic.id = "profilePic";
    profilePic.setAttribute("src", "./images/Profile_Placeholder.png");
    contactCard.appendChild(profilePic);

    const cardDetail = document.createElement("div");
    cardDetail.id = "cardDetail";

    const topPart = document.createElement("div");
    topPart.id = "cardTitle";

    const titleName = document.createElement("div");
    titleName.id = "titleName";

    const editIcon = document.createElement("div");
    editIcon.innerHTML = `<img src="images/pencil.png" onclick="ADDRESSBOOK.EDITMODAL()"/>`;
    editIcon.id = "editCard";

    if (name === "") {
      titleName.innerText = "No Account Set";
      titleName.value = "";
    } else {
      titleName.innerText = name;
      titleName.value = `${name}`;
    }

    topPart.appendChild(titleName);
    topPart.appendChild(editIcon);
    cardDetail.appendChild(topPart);

    const bottomPart = document.createElement("div");
    bottomPart.id = "cardInfo";

    const phoneNum = document.createElement("div");
    phoneNum.id = "phoneNum";
    phoneNum.innerText = `Phone: ${phone}`;
    bottomPart.appendChild(phoneNum);
    if (this.state.psudoState[name].timeZone == "No Time Zone Set") {
      const localTime = document.createElement("div");
      localTime.id = "localTime";
      localTime.innerText = `Local Time: ${timeZone}`;
      bottomPart.appendChild(localTime);
    } else {
      setInterval(ADDRESSBOOK.TIME(timeZone, bottomPart), 60000);
    }
    const notesZone = document.createElement("div");
    notesZone.id = "notesZone";

    const notesLabel = document.createElement("div");
    notesLabel.id = "notesLabel";
    notesLabel.innerText = "Notes: ";
    notesZone.appendChild(notesLabel);

    const notesField = document.createElement("div");
    notesField.id = "notesField";
    notesField.innerText = notes;
    notesZone.appendChild(notesField);
    bottomPart.appendChild(notesZone);

    cardDetail.appendChild(bottomPart);
    contactCard.appendChild(cardDetail);
    contactDetailContainer.appendChild(contactCard);

    const addressesContainer = document.createElement("div");
    addressesContainer.id = "addressesContainer";
    const addHeader = document.createElement("div");
    addHeader.id = "addHeader";
    addHeader.innerHTML = "<h4>ADDRESSES</h4>";
    addressesContainer.appendChild(addHeader);

    const addressSpace = document.createElement("div");
    addressSpace.id = "addressSpace";

    const mineDisplay = document.createElement("div");
    mineDisplay.id = "mine";
    let inc = 0;
    for (let address in this.state.psudoState[name].mine) {
      inc++;
      const toolTip = document.createElement("span");
      toolTip.innerText = "Right click to edit";
      toolTip.className = "tooltiptext";
      const labelDiv = document.createElement("div");
      labelDiv.className = "addressLabel";
      let numbOrLabel = true;
      try {
        JSON.parse(address);
      } catch (error) {
        numbOrLabel = false;
      }
      if (numbOrLabel) {
        labelDiv.innerText = "My Address: ";
      } else {
        labelDiv.innerText = `${address}:`;
      }
      labelDiv.id = "mlable" + inc;
      labelDiv.value = name;
      labelDiv.addEventListener(
        "mouseenter",
        event => {
          event.target.style.color = "#0ca4fb";

          this.setState(
            {
              hoveredover: "label"
            }
          );
          // this.state.hoveredover = "label";

          ADDRESSBOOK.addId = event.target.id[0] + event.target.id.slice(6);
          ADDRESSBOOK.thisadd = document.getElementById(
            ADDRESSBOOK.addId
          ).innerText;

          ADDRESSBOOK.rootAccount = event.target.value;
          ADDRESSBOOK.autofill = event.target.innerText.split(":")[0];
          ADDRESSBOOK.thisid = event.target.id;
        },
        false
      );
      labelDiv.addEventListener(
        "mouseleave",
        event => {
          event.target.style.color = "";

          this.setState(
            {
              hoveredover: "general"
            }
          );
          // this.state.hoveredover = "general";
        },
        false
      );

      const adds = document.createElement("div");
      adds.className = "address";
      adds.innerText = this.state.psudoState[name].mine[address];
      adds.value = this.state.psudoState[name].mine[address];
      adds.id = "m" + inc;
      const copy = document.createElement("div");
      copy.className = "address";

      copy.innerHTML = `<img src="images/editcopy.png" style="{height:10px; width:10px;}" onclick="ADDRESSBOOK.COPYADDRESS(${inc})"></img>`;
      labelDiv.appendChild(toolTip);
      mineDisplay.appendChild(labelDiv);
      mineDisplay.appendChild(adds);
      mineDisplay.appendChild(copy);
    }
    addressesContainer.appendChild(mineDisplay);

    for (let address in this.state.psudoState[name].notMine) {
      inc++;
      const labelDiv = document.createElement("div");
      labelDiv.className = "addressLabel";
      let numbOrLabel = true;
      try {
        JSON.parse(address);
      } catch (error) {
        numbOrLabel = false;
      }
      if (numbOrLabel) {
        labelDiv.innerText = "Their address: ";
      } else {
        labelDiv.innerText = `${address}:`;
      }

      labelDiv.id = "nmlable" + inc;
      labelDiv.value = name;
      labelDiv.addEventListener(
        "mouseenter",
        event => {
          event.target.style.color = "#0ca4fb";

          this.setState(
            {
              hoveredover: "label"
            }
          );
          // this.state.hoveredover = "label";
          ADDRESSBOOK.addId =
            event.target.id.slice(0, 2) + event.target.id.slice(7);
          ADDRESSBOOK.thisadd = document.getElementById(
            ADDRESSBOOK.addId
          ).innerText;

          ADDRESSBOOK.autofill = event.target.innerText.split(":")[0];
          ADDRESSBOOK.thisid = event.target.id;
          ADDRESSBOOK.rootAccount = event.target.value;
        },
        false
      );
      labelDiv.addEventListener(
        "mouseleave",
        event => {
          event.target.style.color = "";

          this.setState(
            {
              hoveredover: "general"
            }
          );
          // this.state.hoveredover = "general";
        },
        false
      );

      const adds = document.createElement("div");
      adds.className = "address";
      adds.innerText = this.state.psudoState[name].notMine[address];
      adds.value = this.state.psudoState[name].notMine[address];
      adds.id = "nm" + inc;
      adds.addEventListener(
        "mouseenter",
        event => {
          event.target.style.color = "#0ca4fb";
                    
          this.setState(
            {
              hoveredover: "outgoing"
            }
          );
          // this.state.hoveredover = "outgoing";
          ADDRESSBOOK.SendOBJ.name = name;
          ADDRESSBOOK.thisadd = event.target.value;
        },
        false
      );
      adds.addEventListener(
        "mouseleave",
        event => {
          event.target.style.color = "";

          this.setState(
            {
              hoveredover: "general"
            }
          );
          // this.state.hoveredover = "general";
        },
        false
      );
      const copy = document.createElement("div");
      copy.className = "address";
      copy.innerHTML = `<img src="images/editcopy.png" style="{height:10px; width:10px;}" onclick="ADDRESSBOOK.COPYADDRESS(${inc})"></img>`;
      mineDisplay.appendChild(labelDiv);
      mineDisplay.appendChild(adds);
      mineDisplay.appendChild(copy);
    }

    contactDetailContainer.appendChild(addressesContainer);
    accountDisplayDiv.appendChild(contactDetailContainer);
  };

  /// TIME
  /// takes in the offset and the mounting point and calculates local time and diplays the local time
  /// Input:
  ///     offSet || number || diffrence in min from GMT to calculate the time in that timezone
  ///     bottomPart || HTML element || mounting point

  ADDRESSBOOK.TIME = (offSet, bottomPart) => 
  {
    let d = new Date();
    let utc = ADDRESSBOOK.today.getTimezoneOffset();
    d.setMinutes(d.getMinutes() + utc);
    d.setMinutes(d.getMinutes() + offSet);

    let h = d.getHours();
    let m = d.getMinutes();
    let i = "AM";
    if (h >= 12) {
      i = "PM";
      h = h - 12;
    }
    if (h === 0) {
      h = "12";
    }
    if (m <= 9) {
      m = `0${m}`;
    }
    const localTime = document.createElement("div");
    localTime.id = "localTime";
    localTime.innerText = `Local Time: ${h}:${m} ${i}`;
    bottomPart.appendChild(localTime);
  };

  /// validateInp
  /// constrains inputs in the phone number inputs to 3 numaric chars and advances to the next feild when reached
  /// Input:
  ///     elem || HTML element || the elemnt being inputed to

  ADDRESSBOOK.validateInp = elem => 
  {
    let validChars = /[0-9]/;
    let strIn = elem.value;
    let strOut = "";
    for (let i = 0; i < strIn.length; i++) {
      strOut += validChars.test(strIn.charAt(i)) ? strIn.charAt(i) : "";
    }
    elem.value = strOut;
    if (elem.id[elem.id.length - 1] !== "4") {
      if (strOut.length >= 3) {
        document.getElementById(elem.id).nextElementSibling.focus();
      }
    }
  };

  /// labelmodal
  /// creates a modal for changing the labels for the addresses
  /// Input:
  ///     id || string || id of the elemnt to be edited
  ///     autofill || string|| the old value

  ADDRESSBOOK.labelmodal = (id, autofill) => 
  {
    // instanciate new modal
    var modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ["overlay", "button", "escape"],
      closeLabel: "Close",
      cssClass: ["custom-class-1", "custom-class-2"],
      onOpen: function() {
        console.log("modal open");
      },
      onClose: function() {
        console.log("modal closed");
      },
      beforeClose: function() {
        // here's goes some logic
        // e.g. save content before closing the modal
        return true; // close the modal
        return false; // nothing happens
      }
    });

    // set content
    modal.setContent(
      `<div class="js-modal-inner">
    <label class="label">New Address Label
      <input class="newAcctInpt" id="new-label-name" type="text" placeholder="Name" value="${autofill}"/>
    </label>
    </div>
    `
    );

    // add a button
    modal.addFooterBtn("Submit", "tingle-btn tingle-btn--primary", function() {
      const newLabel = document.getElementById("new-label-name").value;

      if (ADDRESSBOOK.addId.slice(0, 2) === "nm") {
        const oldLabel = ADDRESSBOOK.getKeyByValue(
          this.state.psudoState[ADDRESSBOOK.rootAccount].notMine,
          ADDRESSBOOK.thisadd
        );
        this.state.psudoState[ADDRESSBOOK.rootAccount].notMine[newLabel] =
          this.state.psudoState[ADDRESSBOOK.rootAccount].notMine[oldLabel];
        delete this.state.psudoState[ADDRESSBOOK.rootAccount].notMine[oldLabel];
      } else {
        const oldLabel = ADDRESSBOOK.getKeyByValue(
          this.state.psudoState[ADDRESSBOOK.rootAccount].mine,
          ADDRESSBOOK.thisadd
        );
        this.state.psudoState[ADDRESSBOOK.rootAccount].mine[newLabel] =
          this.state.psudoState[ADDRESSBOOK.rootAccount].mine[oldLabel];
        delete this.state.psudoState[ADDRESSBOOK.rootAccount].mine[oldLabel];
      }
      config.WriteJson("addressbook.json", this.state.psudoState);
      modal.close();
      ADDRESSBOOK.PROCESSACCOUNTS();
    });
    modal.open();
  };

  /// getKeyByValue
  /// helper method that finds the key in an obj by the value
  /// Input:
  ///     obj || Object || the object to be searched
  ///     value || string || the value to be searched with
  /// Output:
  ///     prop || the key corrasponding to the value inputed

  ADDRESSBOOK.getKeyByValue = (obj, value) => 
  {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (obj[prop] === value) return prop;
      }
    }
  };

  /// EDITMODAL
  /// Modal to edit the details for each account

  ADDRESSBOOK.EDITMODAL = () => 
  {
    let acct = {};
    if (document.getElementById("titleName").innerText === "No Account Set") {
      acct = this.state.psudoState[""];
    } else {
      acct =
        this.state.psudoState[document.getElementById("titleName").innerText];
    }
    let phoneNumRaw = "";
    if (acct.phoneNum !== "No Phone Number Set") {
      phoneNumRaw = acct.phoneNum
        .replace(/[\W_]+/g, " ")
        .trim()
        .split(" ");
    }
    let notesAutofill = acct.notes;
    let modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ["overlay", "button", "escape"],
      closeLabel: "Close",
      cssClass: ["custom-class-1", "custom-class-2"],
      onOpen: function() {
        console.log("modal open");
      },
      onClose: function() {
        console.log("modal closed");
      },
      beforeClose: function() {
        return true;
      }
    });

    // set content
    modal.setContent(
      `<div id="modalcontent" >
        <label class="label">Phone Number
            <div id="phoneLabel">
                <input class="phoneEntry" onkeyup="ADDRESSBOOK.validateInp(this)" id="new-edit-area" type="tel" maxlength="3" placeholder="555"
                ${phoneNumRaw && "value='" + phoneNumRaw[0] + "'"}
                />
                <input class="phoneEntry" onkeyup="ADDRESSBOOK.validateInp(this)" id="new-edit-3" type="tel" maxlength="3" placeholder="555"  ${phoneNumRaw &&
                  "value='" + phoneNumRaw[1] + "'"}
                />
                <input class="phoneEntry" onkeyup="ADDRESSBOOK.validateInp(this)"  id="new-edit-4" type="tel" maxlength="4" placeholder="5555"  ${phoneNumRaw &&
                  "value='" + phoneNumRaw[2] + "'"}
                />
            </div>
        </label>
        <label class="label">Time Zone
            <select class="newAcctInpt" id="new-edit-timezone">
                <option value=0>London, Casablanca, Accra</option>
                <option value=-60>Cabo Verde, Ittoqqortoormiit, Azores Islands</option>
                <option value=-120>Fernando de Noronha, South Sandwich Islands</option>
                <option value=-180>Buenos Aires, Montevideo, São Paulo</option>
                <option value=-210>St. John's, Labrador, Newfoundland</option>
                <option value=-240>Santiago, La Paz, Halifax</option>
                <option value=-300>New York, Lima, Toronto</option>
                <option value=-360>Chicago, Guatemala City, Mexico City</option>
                <option value=-420>Phoenix, Calgary, Ciudad Juárez</option>
                <option value=-480>Los Angeles, Vancouver, Tijuana</option>
                <option value=-540>Anchorage</option>
                <option value=-570>Marquesas Islands</option>
                <option value=-600>Papeete, Honolulu</option>
                <option value=-660>Niue, Jarvis Island, American Samoa</option>
                <option value=-720>Baker Island, Howland Island</option>
                <option value=840>Line Islands</option>
                <option value=780>Apia, Nukuʻalofa</option>
                <option value=765>Chatham Islands</option>
                <option value=720>Auckland, Suva</option>
                <option value=660>Noumea, Federated States of Micronesia</option>
                <option value=630>Lord Howe Island</option>
                <option value=600>Port Moresby, Sydney, Vladivostok</option>
                <option value=570>Adelaide</option>
                <option value=540>Seoul, Tokyo, Yakutsk</option>
                <option value=525>Eucla</option>
                <option value=510>Pyongyang</option>
                <option value=480>Beijing, Singapore, Manila</option>
                <option value=420>Jakarta, Bangkok, Ho Chi Minh City</option>
                <option value=390>Yangon</option>
                <option value=360>Almaty, Dhaka, Omsk</option>
                <option value=345>Kathmandu</option>
                <option value=330>Delhi, Colombo</option>
                <option value=300>Karachi, Tashkent, Yekaterinburg</option>
                <option value=270>Kabul</option>
                <option value=240>Baku, Dubai, Samara</option>
                <option value=210>Tehran</option>
                <option value=180> Istanbul, Moscow, Nairobi</option>
                <option value=120>Athens, Cairo, Johannesburg</option>
                <option value=60>Berlin, Lagos, Madrid</option>
            </select>
        </label>
        <label class="label">Notes
            <textarea class="newAcctInpt" id="new-edit-notes" rows="4">${notesAutofill}</textarea>
        </label>
      
        </div>
      `
    );

    // add a button
    modal.addFooterBtn("Submit", "tingle-btn tingle-btn--primary", function() {
      let name = document.getElementById("titleName").value;
      //change name stuff
      // let newName = document.getElementById("new-edit-name").value;
      let areaCode = document.getElementById("new-edit-area").value;
      let first3 = document.getElementById("new-edit-3").value;
      let last4 = document.getElementById("new-edit-4").value;
      let TZ = JSON.parse(document.getElementById("new-edit-timezone").value);
      let newNotes = document.getElementById("new-edit-notes").value;
      let concat = areaCode + first3 + last4;
      //change name stuff
      // if (newName.trim() !== "") {
      if (concat.trim().length >= 10) {
        this.state.psudoState = Object.assign(this.state.psudoState, {
          [name]: Object.assign(this.state.psudoState[name], {
            phoneNum: `(${areaCode}) ${first3}-${last4}`
          })
        });
      }
      if (TZ !== null || undefined || "") {
        this.state.psudoState = Object.assign(this.state.psudoState, {
          [name]: Object.assign(this.state.psudoState[name], { timeZone: TZ })
        });
      }
      if (newNotes.trim() !== "") {
        this.state.psudoState = Object.assign(this.state.psudoState, {
          [name]: Object.assign(this.state.psudoState[name], {
            notes: newNotes
          })
        });
      }
      config.WriteJson("addressbook.json", this.state.psudoState);
      ADDRESSBOOK.PROCESSACCOUNTS();
      modal.close();
    });

    modal.open();
  };

  /// MODAL
  /// modal for adding accounts and generating new addresses for this wallet

  ADDRESSBOOK.MODAL = () => 
  {
    var modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ["overlay", "button", "escape"],
      closeLabel: "Close",
      cssClass: ["custom-class-1", "custom-class-2"],
      onOpen: function() {
        console.log("modal open");
      },
      onClose: function() {
        console.log("modal closed");
      },
      beforeClose: function() {
        return true;
      }
    });

    // set content
    modal.setContent(`<div id="modalcontent" >
    <label class="label">Name
        <input class="newAcctInpt" id="new-account-name" type="text" placeholder="Name" />
    </label>
    <label class="label">Phone Number
        <div id="phoneLabel">
            <input class="phoneEntry" onkeyup="ADDRESSBOOK.validateInp(this)" id="new-account-area" type="tel" maxlength="3" placeholder="555"
            />
            <input class="phoneEntry" onkeyup="ADDRESSBOOK.validateInp(this)" id="new-account-3" type="tel" maxlength="3" placeholder="555"
            />
            <input class="phoneEntry" onkeyup="ADDRESSBOOK.validateInp(this)" columns="4" id="new-account-4" type="tel" maxlength="4"
                placeholder="5555" />
        </div>
    </label>
    <label class="label">Time Zone
        <select class="newAcctInpt" id="new-account-timezone">
            <option value=0>London, Casablanca, Accra</option>
            <option value=-60>Cabo Verde, Ittoqqortoormiit, Azores Islands</option>
            <option value=-120>Fernando de Noronha, South Sandwich Islands</option>
            <option value=-180>Buenos Aires, Montevideo, São Paulo</option>
            <option value=-210>St. John's, Labrador, Newfoundland</option>
            <option value=-240>Santiago, La Paz, Halifax</option>
            <option value=-300>New York, Lima, Toronto</option>
            <option value=-360>Chicago, Guatemala City, Mexico City</option>
            <option value=-420>Phoenix, Calgary, Ciudad Juárez</option>
            <option value=-480>Los Angeles, Vancouver, Tijuana</option>
            <option value=-540>Anchorage</option>
            <option value=-570>Marquesas Islands</option>
            <option value=-600>Papeete, Honolulu</option>
            <option value=-660>Niue, Jarvis Island, American Samoa</option>
            <option value=-720>Baker Island, Howland Island</option>
            <option value=840>Line Islands</option>
            <option value=780>Apia, Nukuʻalofa</option>
            <option value=765>Chatham Islands</option>
            <option value=720>Auckland, Suva</option>
            <option value=660>Noumea, Federated States of Micronesia</option>
            <option value=630>Lord Howe Island</option>
            <option value=600>Port Moresby, Sydney, Vladivostok</option>
            <option value=570>Adelaide</option>
            <option value=540>Seoul, Tokyo, Yakutsk</option>
            <option value=525>Eucla</option>
            <option value=510>Pyongyang</option>
            <option value=480>Beijing, Singapore, Manila</option>
            <option value=420>Jakarta, Bangkok, Ho Chi Minh City</option>
            <option value=390>Yangon</option>
            <option value=360>Almaty, Dhaka, Omsk</option>
            <option value=345>Kathmandu</option>
            <option value=330>Delhi, Colombo</option>
            <option value=300>Karachi, Tashkent, Yekaterinburg</option>
            <option value=270>Kabul</option>
            <option value=240>Baku, Dubai, Samara</option>
            <option value=210>Tehran</option>
            <option value=180> Istanbul, Moscow, Nairobi</option>
            <option value=120>Athens, Cairo, Johannesburg</option>
            <option value=60>Berlin, Lagos, Madrid</option>
        </select>
    </label>
    <label class="label" id="addressLabel">Address
        <input class="newAcctInpt" id="new-account-address" type="text"  placeholder="Address" />
        
    </label>
    <label class="label">Notes
        <textarea class="newAcctInpt" id="new-account-notes" rows="4"></textarea>

    </label>

  <label id="sliderContainer" >Generate an new address for this wallet</label> 
  <input id="generateNewAddressSwitch" type="checkbox" onchange="ADDRESSBOOK.toggleGenerateNewAddress()" class="switch">

  <span id="errMessage" ></span>
  </div> `);

    modal.addFooterBtn("Submit", "tingle-btn tingle-btn--primary", function() {
      // get the data from the form
      let accountNameElement = document.getElementById("new-account-name");
      let accountName = accountNameElement.value;
      let addressElement = document.getElementById("new-account-address");
      let address = addressElement.value;
      let areaCode = document.getElementById("new-account-area").value;
      let first3 = document.getElementById("new-account-3").value;
      let last4 = document.getElementById("new-account-4").value;
      let TZ = JSON.parse(document.getElementById("new-account-timezone").value);
      let newNotes = document.getElementById("new-account-notes").value;
      let message = document.getElementById("errMessage");

      // figure out wether or not you're adding a new address and then pass it in
      // depending on the configuration while also handling errors
      if (ADDRESSBOOK.generateFlag) {
        if (accountName.trim() !== "" && address == "") {
          console.log("setNewAddress");
          RPC.PROMISE("getnewaddress", [accountName]).then(payload => {
            console.log(payload);
            RPC.PROMISE("setaccount", [address, accountName])
              .then(
                this.setaccount(
                  accountName,
                  areaCode,
                  first3,
                  last4,
                  TZ,
                  newNotes,
                  modal
                )
              )
              .catch(e => {
                console.log(e);
                ADDRESSBOOK.Toaster(
                  "Unable to set account at this time.",
                  message
                );
              });
          });
        } else {
          ADDRESSBOOK.Toaster("Account must have a name.", message);
        }
      } else if (!ADDRESSBOOK.generateFlag) {
        if (accountName.trim() !== "") {
          if (address !== "") {
            RPC.PROMISE("validateaddress", [address])
              .then(payload => {
                console.log("Addressbook Payload:", payload);
                RPC.PROMISE("setaccount", [address, accountName])
                  .then(
                    this.setaccount(
                      accountName,
                      areaCode,
                      first3,
                      last4,
                      TZ,
                      newNotes,
                      modal
                    )
                  )
                  .catch(e => {
                    console.log(e);
                    ADDRESSBOOK.Toaster(
                      "Unable to set account at this time.",
                      message
                    );
                  });
              })
              .catch(e => {
                console.log(e);
                ADDRESSBOOK.Toaster("Invalid Address.", message);
              });
          } else {
            ADDRESSBOOK.Toaster("Address left blank.", message);
          }
        } else {
          ADDRESSBOOK.Toaster("Account must have a name.", message);
        }
      }
    });

    modal.open();
  };

  /// Toaster
  /// creates a timed out notification for user feedback
  /// Input:
  ///     string || string || message to be displayed
  ///     element || HTML element || the element it'll be displayed in

  ADDRESSBOOK.Toaster = (string, element) => 
  {
    element.innerText = string;
    element.style.visibility = "visible";
    setTimeout(() => {
      element.style.visibility = "hidden";
    }, 3000);
  };

  /// toggleGenerateNewAddress
  /// toggles weather you are adding a new account or generating a new address for the wallet

  ADDRESSBOOK.toggleGenerateNewAddress = () => 
  {
    let addressFeild = document.getElementById("addressLabel");
    let addressinput = document.getElementById("new-account-address");
    let generateSwitch = document.getElementById("generateNewAddressSwitch");
    console.log();
    // if the switch is in the off position then hide of the address feild and set a flag to generate a new address for this wallet
    // else revert to settings for adding a new account
    if (!ADDRESSBOOK.generateFlag && generateSwitch.checked) {
      addressinput.value = "";
      addressFeild.style = "display: none;";
    } else {
      addressFeild.style = "";
    }
    ADDRESSBOOK.generateFlag = !ADDRESSBOOK.generateFlag;
  };

  /// CLOSEMODAL
  /// closes the modal

  ADDRESSBOOK.CLOSEMODAL = () => 
  {
    let overlay = document.getElementById("overlay");
    let modal = document.getElementById("modal");

    config.WriteJson("addressbook.json", this.state.psudoState);

    overlay.remove();
    modal.remove();
  };

  ADDRESSBOOK.exporttoCSV = () => 
  {
    // console.log(this.state.psudoState);

    const rows = []; //Set up a blank array for each row

    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      "Account Name",
      "Label",
      "Address",
      "Phone Number",
      "Time Zone",
      "Notes"
    ];
    rows.push(NameEntry);

    for (let account in this.state.psudoState) {
      let accountname = "";
      // let mine = Array.from(this.state.psudoState[account].mine);
      let mine = Object.keys(this.state.psudoState[account].mine).map(key => {
        return [key, this.state.psudoState[account].mine[key]];
      });
      let notMine = Object.keys(this.state.psudoState[account].notMine).map(
        key => {
          return [key, this.state.psudoState[account].notMine[key]];
        }
      );

      if (account === "") {
        accountname = "No Account Name Set";
      } else {
        accountname = account;
      }

      let timezone = "";
      switch (this.state.psudoState[account].timeZone) {
        case 0:
          timezone = "London";
          break;
        case -60:
          timezone = "Cabo Verde";
          break;
        case -120:
          timezone = "Fernando de Noronha";
          break;
        case -180:
          timezone = "Buenos Aires";
          break;
        case -210:
          timezone = "Newfoundland";
          break;
        case -240:
          timezone = "Santiago";
          break;
        case -300:
          timezone = "New York";
          break;
        case -360:
          timezone = "Chicago";
          break;
        case -420:
          timezone = "Phoenix";
          break;
        case -480:
          timezone = "Los Angeles";
          break;
        case -540:
          timezone = "Anchorage";
          break;
        case -570:
          timezone = "Marquesas Islands";
          break;
        case -600:
          timezone = "Papeete";
          break;
        case -660:
          timezone = "Niue";
          break;
        case -720:
          timezone = "Baker Island";
          break;
        case 840:
          timezone = "Line Islands";
          break;
        case 780:
          timezone = "Apia";
          break;
        case 765:
          timezone = "Chatham Islands";
          break;
        case 720:
          timezone = "Auckland";
          break;
        case 660:
          timezone = "Noumea";
          break;
        case 630:
          timezone = "Lord Howe Island";
          break;
        case 600:
          timezone = "Port Moresby";
          break;
        case 570:
          timezone = "Adelaide";
          break;
        case 540:
          timezone = "Tokyo";
          break;
        case 525:
          timezone = "Eucla";
          break;
        case 510:
          timezone = "Pyongyang";
          break;
        case 480:
          timezone = "Beijing";
          break;
        case 420:
          timezone = "Bangkok";
          break;
        case 390:
          timezone = "Yangon";
          break;
        case 360:
          timezone = "Almaty";
          break;
        case 345:
          timezone = "Kathmandu";
          break;
        case 330:
          timezone = "Delhi";
          break;
        case 300:
          timezone = "Karachi";
          break;
        case 270:
          timezone = "Kabul";
          break;
        case 240:
          timezone = "Dubai";
          break;
        case 210:
          timezone = "Tehran";
          break;
        case 180:
          timezone = "Moscow";
          break;
        case 120:
          timezone = "Athens";
          break;
        case 60:
          timezone = "Berlin";
          break;
        default:
          timezone = this.state.psudoState[account].timeZone;
          break;
      }

      // console.log(this.state.psudoState[account], "test");
      let tempentry = [
        accountname,
        "",
        "",
        this.state.psudoState[account].phoneNum,
        timezone,
        this.state.psudoState[account].notes
      ];
      rows.push(tempentry);
      mine.map(arr => {
        let isnum = /^\d+$/.test(arr[0]);
        if (isnum) {
          arr[0] = "My Address";
        }
        rows.push(["", arr[0], arr[1], "", "", ""]);
      });
      notMine.map(arr => {
        let isnum = /^\d+$/.test(arr[0]);
        if (isnum) {
          arr[0] = "Their Address";
        }
        rows.push(["", arr[0], arr[1], "", "", ""]);
      });
    }
    let csvContent = "data:text/csv;charset=utf-8,"; //Set formating
    rows.forEach(function(rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    }); //format each row

    let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv"); //give link an action and a default name for the file. MUST BE .csv

    document.body.appendChild(link); // Required for FF

    link.click(); //Finish by "Clicking" this link that will execute the download action we listed above
  }

  AJAX.CALLBACK.MODULE.Final = (ResponseObject, Address, TagID) => 
  {
    /** Register Global Variables **/
    AJAX.LOADER.Show();
    ADDRESSBOOK.Location = Address;
    RPC.GET("listaccounts", [0], ADDRESSBOOK.CALLBACK.LOADDATA);
  }

  render() {
    return (

      <div id="addressbook">

        <h2>Address Book</h2>

        <div className="panel">

          <div id="nxs-address-display">

              <!-- This will be dynamically populated from the data from RPC -->

          </div>

          <div style="display: flex; flex-direction: row;">

              <button id="new-address-button" class="button hero ghost" onclick="ADDRESSBOOK.MODAL()">ADD ACCOUNT</button>
              <button id="export-csv-button" class="button hero ghost" onclick="ADDRESSBOOK.exporttoCSV()">EXPORT AS CSV</button>

          </div>

        </div>

      </div>

    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);