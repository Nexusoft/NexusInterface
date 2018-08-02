import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import { remote } from "electron";
import config from "../../api/configuration";
import * as RPC from "../../script/rpc";
import Modal from 'react-responsive-modal';

import ContactList from "./ContactList";
import ContactDetail from "./ContactDetail";

import ContextMenuBuilder from "../../contextmenu";

var psudoState = null;

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
      generateFlag: false,

      selectedContactIndex: 0,
      addcontactmodalopen: false
    };
  }

  componentDidMount() {

    RPC.GET("listaccounts", [0], this.loaddata.bind(this));

    this.addressbookcontextfunction = this.addressbookcontextfunction.bind(this);

    window.addEventListener("contextmenu", this.addressbookcontextfunction, false);
    
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
          // this.labelmodal(this.state.thisid, this.state.autofill);
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

  //
  // Read the addressbook.json file and return the contents as an object, if it doesn't exist initialize the file
  //
  readaddressbookjson()
  {
    let json = null;

    try {
      json = config.ReadJson("addressbook.json");
      
    } 
    catch (err) 
    {
      json = {};
      config.WriteJson("addressbook.json", json);
    }

    return json;
  }


  loaddata(ResponseObject, Address, PostData)
  {
    if (ResponseObject.readyState != 4)
      return;

    if (ResponseObject.status == 200)
    {
      let getAddressesPromises = [];
      
      psudoState = this.readaddressbookjson();

      let results = JSON.parse(ResponseObject.responseText).result;

      // if (psudoState === null)
      if (psudoState.length === 0)
      {
        psudoState = Object.assign(psudoState, results);
      }

      let accounts = Object.keys(results);

      for (let i = 0; i < accounts.length; i++) 
      {
        // let account = accounts[i];
        getAddressesPromises.push(RPC.PROMISE("getaddressesbyaccount", [accounts[i]]));
      }

      Promise.all(getAddressesPromises).then(this.processaddresses);
    }
  }

  processaddresses = (payload) => {
  
    let validateAddressPromises = [];

    payload.map(element => {

      element.addresses.map(address => {
        validateAddressPromises.push(RPC.PROMISE("validateaddress", [address]));
      });

    });

    Promise.all(validateAddressPromises).then(this.processvalidatedaddresses);

  }

  processvalidatedaddresses = (payload) => {

      payload.map(this.processvalidatedaddress);

      this.saveaddressbookstate(psudoState);

  }

  processvalidatedaddress = (e, i) => {

      if (e.ismine)
      {
        if (typeof psudoState[e.account] !== "object")
        {

          psudoState[e.account] = {
            // numAddreses: 0,
            mine: {},
            notMine: {},
            phoneNum: null,
            timeZone: null,
            notes: null
          };

        }

        if (e.isvalid)
        {
          if (psudoState[e.account] || psudoState[e.account] === "")
          {
            if (!Object.values(psudoState[e.account].mine).includes(e.address))
            {

              psudoState[e.account].mine = Object.assign(
                psudoState[e.account].mine,
                { [i]: e.address }
              );

            }
          }
        }
      }
      else
      {

        if (typeof psudoState[e.account] !== "object")
        {

          psudoState[e.account] = {
            mine: {},
            notMine: {},
            phoneNum: null,
            timeZone: null,
            notes: null
          };

        }

        if (e.isvalid) {
          if (psudoState[e.account] || psudoState[e.account] === "")
          {
            if (!Object.values(psudoState[e.account].notMine).includes(e.address))
            {

              psudoState[e.account].notMine = Object.assign(
                psudoState[e.account].notMine,
                { [i]: e.address }
              );

            }
          }
        }
      }
  }

  saveaddressbookstate(state) {

    console.log("saving addressbook.json");
    config.WriteJson("addressbook.json", state);

    this.setState(
      {
        psudoState: state
      }
    );

  }

  exporttoCSV()
  {
    // console.log(psudoState);

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

    for (let account in psudoState) {
      let accountname = "";
      // let mine = Array.from(psudoState[account].mine);
      let mine = Object.keys(psudoState[account].mine).map(key => {
        return [key, psudoState[account].mine[key]];
      });
      let notMine = Object.keys(psudoState[account].notMine).map(
        key => {
          return [key, psudoState[account].notMine[key]];
        }
      );

      if (account === "") {
        accountname = "No Account Name Set";
      } else {
        accountname = account;
      }

      let timezone = "";
      switch (psudoState[account].timeZone) {
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
          timezone = psudoState[account].timeZone;
          break;
      }

      // console.log(psudoState[account], "test");
      let tempentry = [
        accountname,
        "",
        "",
        psudoState[account].phoneNum,
        timezone,
        psudoState[account].notes
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

  contactSelected = (index) => {

    this.setState({
      selectedContactIndex: index
    });

  };

  openaddcontactmodal = () => {

    this.setState(
      {
        addcontactmodalopen: true
      }
    );

  }

  closeaddcontactmodal = () => {
    
    this.setState(
      {
        addcontactmodalopen: false
      }
    );

  }

  addcontact = () => {
    
    let name = document.getElementById("new-account-name").value;
    let phone = document.getElementById("new-account-phone").value;
    let timezone = JSON.parse(document.getElementById("new-account-timezone").value);
    let address = document.getElementById("new-account-address").value;
    let notes = document.getElementById("new-account-notes").value;

    // Input Validation: Name
    if (name.trim === "")
    {
      console.debug("Contact name is empty");
      return;
    }

    // Input Validation: Address
    if (address.trim === "")
    {
      console.debug("Address is empty");
      return;
    }

    RPC.PROMISE("validateaddress", [address])
      .then(payload => {

        console.debug("Addressbook Payload:", payload);

        RPC.PROMISE("setaccount", [address, name])
          .then(success => {
              this.updateaccountstate(name, phone, timezone, notes);
              console.debug("Successfully added contact");
              this.closeaddcontactmodal();
            }
          )
          .catch(e => {
            console.debug("Unable to set account at this time: " + e);
          });

      })
      .catch(e => {
        console.debug("Invalid Address: " + e);
      });

  }

  addreceiveaddress = () => {

    RPC.PROMISE("getnewaddress", [""])
      .then(payload => {

        console.log(payload);

        RPC.PROMISE("setaccount", ["", ""])
          .then(
            this.updateaccountstate("", phone, timezone, notes)
          )
          .catch(e => {
              console.log(e);
          });

      });

  }

  updatecontact = () => {

    // state was already updated, clone to a new object then save to trigger refresh
    const newState = {...this.state.psudoState};

    this.saveaddressbookstate(newState);

  }

  updateaccountstate(name, phone, timezone, notes)
  {
    psudoState[name] = {
      mine: {},
      notMine: {}
    };

    if (phone.trim().length >= 10) {
      psudoState = Object.assign(psudoState, {
        [name]: Object.assign(psudoState[name], {
          // phoneNum: `(${areaCode}) ${first3}-${last4}`
          phoneNum: phone
        })
      });
    }

    if (timezone !== null || undefined || "") {
      psudoState = Object.assign(psudoState, {
        [name]: Object.assign(psudoState[name], {
          timeZone: timezone
        })
      });
    }

    if (notes.trim() !== "") {
      psudoState = Object.assign(psudoState, {
        [name]: Object.assign(psudoState[name], {
          notes: notes
        })
      });
    }

    console.log(psudoState);

    config.WriteJson("addressbook.json", psudoState);

    // RPC.GET("listaccounts", [0], this.refresh);
  }

  render() {

    //TODO: Should this be in componentDidMount???
    // RPC.GET("listaccounts", [0], this.loaddata.bind(this));

    return (

      <div id="addressbook">

        <h2>Address Book</h2>

        <a className="refresh" onClick={() => this.refresher()}>Export Contacts</a>

        <div className="panel">

          <ContactList 
            data={this.state.psudoState}
            onClick={this.contactSelected} 
            onAdd={this.openaddcontactmodal}/>

          <ContactDetail 
            data={this.state.psudoState}
            selectedIndex={this.state.selectedContactIndex} 
            onAddReceiveAddress={this.addreceiveaddress} 
            onUpdate={this.updatecontact}/>

          <Modal 
            open={this.state.addcontactmodalopen} 
            onClose={this.closeaddcontactmodal} 
            center 
            classNames={{ modal: 'modal' }}>

            <h2 >Add Contact</h2>

            <div className="field">
              <label htmlFor="new-account-name">Name</label>
              <input id="new-account-name" type="text" placeholder="Name" />
            </div>

            <div className="field">
              <label htmlFor="new-account-name">Phone #</label>
              <input id="new-account-phone" type="tel" placeholder="Phone #" />
            </div>

            <div className="field">
              <label htmlFor="new-account-timezone">Time Zone</label>
              <select id="new-account-timezone">
                <option value="0">London, Casablanca, Accra</option>
                <option value="-60">Cabo Verde, Ittoqqortoormiit, Azores Islands</option>
                <option value="-120">Fernando de Noronha, South Sandwich Islands</option>
                <option value="-180">Buenos Aires, Montevideo, São Paulo</option>
                <option value="-210">St. John's, Labrador, Newfoundland</option>
                <option value="-240">Santiago, La Paz, Halifax</option>
                <option value="-300">New York, Lima, Toronto</option>
                <option value="-360">Chicago, Guatemala City, Mexico City</option>
                <option value="-420">Phoenix, Calgary, Ciudad Juárez</option>
                <option value="-480">Los Angeles, Vancouver, Tijuana</option>
                <option value="-540">Anchorage</option>
                <option value="-570">Marquesas Islands</option>
                <option value="-600">Papeete, Honolulu</option>
                <option value="-660">Niue, Jarvis Island, American Samoa</option>
                <option value="-720">Baker Island, Howland Island</option>
                <option value="840">Line Islands</option>
                <option value="780">Apia, Nukuʻalofa</option>
                <option value="765">Chatham Islands</option>
                <option value="720">Auckland, Suva</option>
                <option value="660">Noumea, Federated States of Micronesia</option>
                <option value="630">Lord Howe Island</option>
                <option value="600">Port Moresby, Sydney, Vladivostok</option>
                <option value="570">Adelaide</option>
                <option value="540">Seoul, Tokyo, Yakutsk</option>
                <option value="525">Eucla</option>
                <option value="510">Pyongyang</option>
                <option value="480">Beijing, Singapore, Manila</option>
                <option value="420">Jakarta, Bangkok, Ho Chi Minh City</option>
                <option value="390">Yangon</option>
                <option value="360">Almaty, Dhaka, Omsk</option>
                <option value="345">Kathmandu</option>
                <option value="330">Delhi, Colombo</option>
                <option value="300">Karachi, Tashkent, Yekaterinburg</option>
                <option value="270">Kabul</option>
                <option value="240">Baku, Dubai, Samara</option>
                <option value="210">Tehran</option>
                <option value="180">Istanbul, Moscow, Nairobi</option>
                <option value="120">Athens, Cairo, Johannesburg</option>
                <option value="60">Berlin, Lagos, Madrid</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="new-account-address">Nexus Address</label>
              <input id="new-account-address" type="text"  placeholder="Nexus Address" />
            </div>

            <div className="field">
              <label htmlFor="new-account-notes">Notes</label>
              <textarea id="new-account-notes" rows="4"></textarea>
            </div>

            <button className="button" onClick={this.addcontact}>Add Contact</button>

          </Modal>

        </div>

      </div>

    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);