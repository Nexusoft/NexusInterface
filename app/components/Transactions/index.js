import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { remote } from "electron";
import Request from "request";
import Table from "../../script/utilities-react";
import * as RPC from "../../script/rpc";
import { Promise } from "bluebird-lst";
import * as TYPE from "../../actions/actiontypes";
import Modal from "react-responsive-modal";
import {
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryStack,
  VictoryGroup,
  VictoryVoronoiContainer,
  VictoryAxis,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryBrushContainer,
  VictoryLine,
  VictoryTheme,
  createContainer,
  Flyout
} from "victory";

import transactionsimg from "../../images/transactions.svg";

import ContextMenuBuilder from "../../contextmenu";
import config from "../../api/configuration";

/* TODO: THIS DOESN'T WORK AS IT SHOULD, MUST BE SOMETHING WITH WEBPACK NOT RESOLVING CSS INCLUDES TO /node_modules properly */
// import "react-table/react-table.css"

/* TODO: THIS DOESN"T WORK EITHER, COULD BE DUE TO WEBPACK CONFIG FOR ExtractTextPlugin? */
//import tablestyles from "./react-table.css";
import styles from "./style.css";

let tempaddpress = new Map();
var rp = require("request-promise");

const mapStateToProps = state => {
  return {
    ...state.transactions,
    ...state.common,
    ...state.overview,
    ...state.addressbook,
    ...state.settings
  };
};
const mapDispatchToProps = dispatch => ({
  SetWalletTransactionArray: returnData => {
    dispatch({ type: TYPE.SET_WALL_TRANS, payload: returnData });
  },
  SetSendAgainData: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_SENDAGAIN, payload: returnData });
  },
  SetExploreInfo: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_EXPLOREINFO, payload: returnData });
  },
  UpdateConfirmationsOnTransactions: returnData => {
    dispatch({ type: TYPE.UPDATE_CONFIRMATIONS, payload: returnData });
  },
  UpdateCoinValueOnTransaction: returnData => {
    dispatch({ type: TYPE.UPDATE_COINVALUE, payload: returnData });
  },
  UpdateFeeOnTransaction: returnData => {
    dispatch({ type: TYPE.UPDATE_FEEVALUE, payload: returnData });
  }
});

class Transactions extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.copyRef = element => {
      this.textCopyArea = element;
    }
    this.state = {
      walletTransactions: [
        {
          transactionnumber: 0,
          confirmations: 0,
          time: 0,
          category: "",
          amount: 0,
          txid: 0,
          account: "",
          address: "",
          value: {
            USD: 0,
            BTC: 0
          },
          coin: "Nexus",
          fee: 0
        }
      ],
      tableColumns: [],
      displayTimeFrame: "All",
      amountFilter: 0,
      categoryFilter: "all",
      addressFilter: "",
      zoomDomain: {
        x: [
          new Date(
            new Date().getFullYear() - 1,
            new Date().getMonth(),
            new Date().getDate(),1,1,1,1
          ),
          new Date()
        ],
        y: [0, 1]
      },
      isHoveringOverTable: false,
      hoveringID: 999999999999,
      open: false,
      historyData: new Map(),
      transactionsToCheck: [],
      mainChartWidth: 0,
      mainChartHeight: 0,
      miniChartWidth: 0,
      miniChartHeight: 0,
      tableHeight: {
        height: 200
      },
      addressLabels: new Map(),
      refreshInterval: undefined,
      highlightedBlockNum: "Loading",
      highlightedBlockHash: "Loading",
      needsHistorySave: false,
      copyBuffer: ""
    };
  }

  /// Component Did Mount
  /// Life cycle hook for page getting loaded
  componentDidMount() {
    this._isMounted = true;
    this.updateChartAndTableDimensions();
    this.props.googleanalytics.SendScreen("Transactions");

    this.gethistorydatajson();
    let myaddresbook = this.readAddressBook();
    if (myaddresbook != undefined) {
      for (let key in myaddresbook.addressbook) {
        const eachAddress = myaddresbook.addressbook[key];
        const primaryadd = eachAddress["notMine"]["Primary"];
        if (primaryadd != undefined) {
          tempaddpress.set(primaryadd, key);
        }
        for (let addressname in eachAddress["notMine"]) {
          tempaddpress.set(
            eachAddress["notMine"][addressname].address,
            eachAddress.name + "-" + eachAddress["notMine"][addressname].label
          );
        }
      }
    }
    for (let key in this.props.myAccounts) {
      for (let eachaddress in this.props.myAccounts[key].addresses) {
        tempaddpress.set(
          this.props.myAccounts[key].addresses[eachaddress],
          "My Address-" + this.props.myAccounts[key].account
        );
      }
    }

    this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));

    let interval = setInterval(() => {
      this.getTransactionData(this.setConfirmationsCallback.bind(this));
    }, 60000);
    this.setState({
      refreshInterval: interval,
      addressLabels: tempaddpress
    });

    this.updateChartAndTableDimensions = this.updateChartAndTableDimensions.bind(
      this
    );
    window.addEventListener(
      "resize",
      this.updateChartAndTableDimensions,
      false
    );

    this.transactioncontextfunction = this.transactioncontextfunction.bind(
      this
    );
    window.addEventListener(
      "contextmenu",
      this.transactioncontextfunction,
      false
    );
  }

  loadMyAccounts() {
    RPC.PROMISE("listaccounts", [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(account =>
          RPC.PROMISE("getaddressesbyaccount", [account])
        )
      ).then(payload => {
        let validateAddressPromises = [];

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE("validateaddress", [address])
            );
          });
        });

        Promise.all(validateAddressPromises).then(payload => {
          let accountsList = [];
          let myaccts = payload.map(e => {
            if (e.ismine && e.isvalid) {
              let index = accountsList.findIndex(ele => {
                if (ele.account === e.account) {
                  return ele;
                }
              });

              if (index === -1) {
                accountsList.push({
                  account: e.account,
                  addresses: [e.address]
                });
              } else {
                accountsList[index].addresses.push(e.address);
              }
            }
          });
          for (let key in accountsList) {
            for (let eachaddress in accountsList[key].addresses) {
              tempaddpress.set(
                accountsList[key].addresses[eachaddress],
                "My Account-" + accountsList[key].account
              );
            }
          }
          this.setState(
            {
              addressLabels: tempaddpress
            },
            () => {
              this.getTransactionData(true);
            }
          );
        });
      });
    });
  }

  /// Component Did Update
  /// Life cycle hook for prop update
  componentDidUpdate(previousprops) {
    if (this.props.txtotal != previousprops.txtotal) {
      this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));
    }
  }

  /// Component Will Unmount
  /// Life cycle hook for leaving the page
  componentWillUnmount() {
    this._isMounted = false;
    this.SaveHistoryDataToJson();
    clearInterval(this.state.refreshInterval);
    this.setState({
      refreshInterval: null
    });
    window.removeEventListener("resize", this.updateChartAndTableDimensions);
    window.removeEventListener("contextmenu", this.transactioncontextfunction);
  }

  /// Set COnfirmations Callback
  /// The callback for when we want to update just the confirmations
  setConfirmationsCallback(incomingData) {
    this.props.UpdateConfirmationsOnTransactions(incomingData);
  }

  /// Set On Mount Transaction Callback
  /// The callback for the on Mount State
  setOnmountTransactionsCallback(incomingData) {
    let objectheaders = Object.keys(this.state.walletTransactions[0]);
    let tabelheaders = [];
    objectheaders.forEach(element => {
      tabelheaders.push({
        Header: element,
        accessor: element
      });
    });

    this.props.SetWalletTransactionArray(incomingData);
    let tempZoomDomain = {
      x: [
        new Date(),
        new Date(new Date().getFullYear() + 1,1,1,1,1,1,1)
      ]
    }
    
    if (incomingData != undefined && incomingData.length > 0)
    {
      tempZoomDomain = {
        x: [
          new Date(incomingData[0].time * 1000),
          new Date((incomingData[incomingData.length - 1].time + 1000) * 1000)
        ]
      }
    }
    this.setState({
      tableColumns: tabelheaders,
      zoomDomain: tempZoomDomain
    });
    /// Just trying to give some space on this not important call
    setTimeout(() => {
      let promisnew = new Promise((resolve, reject) => {
        let temp = this.state.transactionsToCheck;
        incomingData.forEach(element => {
          let temphistoryData = this.findclosestdatapoint(
            element.time.toString()
          );
          if (temphistoryData == undefined) {
            temp.push(element.time);
          }
        });

        resolve(temp);
      });
      promisnew.then(payload => {
        this.setState({
          transactionsToCheck: payload
        });
        this.gothroughdatathatneedsit();
      });

      incomingData.forEach(element => {
        if (element.category == "send")
        RPC.PROMISE("gettransaction",[element.txid]).then( payload => {
           this.setFeeValuesOnTransaction(element.time,payload.fee);
        });
      });
    }, 1000);
  }

  /// Update Chart and Table Dimensions
  /// Updates the height and width of the chart and table when you resize the window
  updateChartAndTableDimensions(event) {
    let chart = document.getElementById("transactions-chart");
    let filters = document.getElementById("transactions-filters");
    let details = document.getElementById("transactions-details");
    let parent = chart.parentNode;

    let parentHeight =
      parseInt(parent.clientHeight) -
      parseInt(
        window.getComputedStyle(parent, "").getPropertyValue("padding-top")
      ) -
      parseInt(
        window.getComputedStyle(parent, "").getPropertyValue("padding-bottom")
      );
    let filtersHeight =
      parseInt(filters.offsetHeight) +
      parseInt(
        window.getComputedStyle(filters, "").getPropertyValue("margin-top")
      ) +
      parseInt(
        window.getComputedStyle(filters, "").getPropertyValue("margin-bottom")
      );
    let chartHeight =
      parseInt(chart.offsetHeight) +
      parseInt(
        window.getComputedStyle(chart, "").getPropertyValue("margin-top")
      ) +
      parseInt(
        window.getComputedStyle(chart, "").getPropertyValue("margin-bottom")
      );
    let detailsHeight = parentHeight - filtersHeight - chartHeight;

    let mainHeight = 150; // fixed height, should match CSS
    let miniHeight = 50 - 8; // right now this is disabled, if re-enabled this needs to be set properly

    this.setState({
      mainChartWidth: chart.clientWidth,
      miniChartWidth: chart.clientWidth,
      mainChartHeight: mainHeight,
      miniChartHeight: miniHeight,
      tableHeight: {
        height: detailsHeight
      }
    });
  }

  /// Transaction Context Function
  /// This is the method that is called when the user pressed the right click
  /// Input:
  ///   e || Event || Default Events given by the system for right click
  transactioncontextfunction(e) {
    // Prevent default action of right click
    e.preventDefault();

    const defaultcontextData = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(defaultcontextData);
    //create new custom
    let transactiontablecontextmenu = new remote.Menu();

    //Creates the action that happens when you click
    let moreDatailsCallback = function() {
      this.setState({
        highlightedBlockHash: "Loading",
        highlightedBlockNum: "Loading",
        open: true
      });

      if (this.props.walletitems[this.state.hoveringID].confirmations != 0) {
        RPC.PROMISE("gettransaction", [
          this.props.walletitems[this.state.hoveringID].txid
        ]).then(payload => {
          RPC.PROMISE("getblock", [payload.blockhash]).then(payload2 => {
            this.setState({
              highlightedBlockHash: payload.blockhash,
              highlightedBlockNum: payload2.height
            });
          });
        });
      }
    };
    moreDatailsCallback = moreDatailsCallback.bind(this);

    // Build out the context menu

    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: "More Details",
        click() {
          moreDatailsCallback();
        }
      })
    );

    let tablecopyaddresscallback = function() {
      if (this.state.hoveringID != 999999999999)
      {
        this.copysomethingtotheclipboard(
          this.props.walletitems[this.state.hoveringID].address
        );
      }
    };
    tablecopyaddresscallback = tablecopyaddresscallback.bind(this);

    let tablecopyamountcallback = function() {
      if (this.state.hoveringID != 999999999999)
      {
        this.copysomethingtotheclipboard(
          this.props.walletitems[this.state.hoveringID].amount
        );
       }
    };
    tablecopyamountcallback = tablecopyamountcallback.bind(this);

    let tablecopyaccountcallback = function() {
      if (this.state.hoveringID != 999999999999)
      {
        this.copysomethingtotheclipboard(
          this.props.walletitems[this.state.hoveringID].account
        );
      }
    };
    tablecopyaccountcallback = tablecopyaccountcallback.bind(this);

    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: "Copy",
        submenu: [
          {
            label: "Address",
            click() {
              tablecopyaddresscallback();
            }
          },
          {
            label: "Account",
            click() {
              tablecopyaccountcallback();
            }
          },
          {
            label: "Amount",
            click() {
              tablecopyamountcallback();
            }
          }
        ]
      })
    );

    // Additional Functions for the context menu

    let sendtoSendPagecallback = function() {
      this.props.SetSendAgainData({
        address: this.state.walletTransactions[this.state.hoveringID].address,
        account: this.state.walletTransactions[this.state.hoveringID].account,
        amount: this.state.walletTransactions[this.state.hoveringID].amount
      });
      this.context.router.history.push("/SendRecieve");
    };
    //sendtoSendPagecallback = sendtoSendPagecallback.bind(this);

    let sendtoBlockExplorercallback = function() {
      this.props.SetExploreInfo({
        transactionId: this.state.walletTransactions[this.state.hoveringID].txid
      });
      this.context.router.history.push("/BlockExplorer");
    };

    //sendtoBlockExplorercallback = sendtoBlockExplorercallback.bind(this);

    /* //Putting this on hold
    //Add Resending the transaction option
    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: "Send Again",
        click() {

          sendtoSendPagecallback();
          
        }
      })
    ); */
    /*  Currently Block Explorer is turned off. 
    //Add Open Explorer Option
    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: "Open Explorer",
        click() {
          sendtoBlockExplorercallback();
        }
      })
    );
    */
    if (this.state.isHoveringOverTable) {
      transactiontablecontextmenu.popup(remote.getCurrentWindow());
    } else {
      defaultcontextmenu.popup(remote.getCurrentWindow());
    }
  }

  /// Copy Something To The Clipboard
  /// Copies the input to the clipboard
  /// Input :
  ///   instringtocopy      || String || String to copy
  copysomethingtotheclipboard(instringtocopy) {
   /*
    let tempelement = document.createElement("textarea");
    tempelement.value = instringtocopy;
    document.body.appendChild(tempelement);
    tempelement.select();
    document.execCommand("copy");
    document.body.removeChild(tempelement);
*/
  //this.textCopyArea.value = instringtocopy;
    

    
    this.setState(
      {
        copyBuffer: instringtocopy
      },
      () => {
        
        console.log(instringtocopy);
       this.textCopyArea.focus();
        this.textCopyArea.select();
        document.execCommand("copy");
        console.log(this.textCopyArea);
        console.log(this.textCopyArea.value);
    //let tempcopy = this.textCopyArea;
      }
    )  ;
    

  }

  /// Get Transaction Data
  /// Gets all the data from each account held by the wallet
  getTransactionData(finishingCallback) {
    const incomingMyAccounts = this.props.myAccounts;
    let listedaccounts = [];
    let promisList = [];

    incomingMyAccounts.forEach(element => {
      listedaccounts.push(element.account);
      promisList.push(
        RPC.PROMISE("listtransactions", [element.account, 9999, 0])
      );
    });
    let tempWalletTransactions = [];

    let settingsCheckDev = require("../../api/settings.js").GetSettings();

    /// If in Dev Mode add some random transactions
    if (settingsCheckDev.devMode == true) {
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
      tempWalletTransactions.push(this.TEMPaddfaketransaction());
    }
    if (
      promisList == null ||
      promisList == undefined ||
      promisList.length == 0
    ) {
      return;
    }

    Promise.all(promisList).then(payload => {
      payload.forEach(element => {
        for (let index = 0; index < element.length; index++) {
          const element2 = element[index];
          // if a move happend don't place it in the chart or table.
          if (element2.category === "move") {
            return;
          }
          const getLable = this.state.addressLabels.get(element2.address);

          let tempTrans = {
            transactionnumber: index,
            confirmations: element2.confirmations,
            time: element2.time,
            category: element2.category,
            amount: element2.amount,
            txid: element2.txid,
            account: getLable,
            address: element2.address,
            value: {
              USD: 0,
              BTC: 0
            },
            coin: "Nexus",
            fee: 0
          };
          let closestData = this.findclosestdatapoint(element2.time.toString());
          if (closestData != undefined) {
            tempTrans.value[this.props.settings.fiatCurrency] =
              closestData[this.props.settings.fiatCurrency];
            tempTrans.value.BTC = closestData.BTC;
          }
          tempWalletTransactions.push(tempTrans);
        }
      });

      tempWalletTransactions.sort((a, b) => {
        return a.time > b.time ? 1 : b.time > a.time ? -1 : 0;
      });

      if (finishingCallback != undefined) {
        finishingCallback(tempWalletTransactions);
        return;
      } else {
        this.props.SetWalletTransactionArray(tempWalletTransactions);
      }
    });
  }

  /// Transaction Time Frame Change
  /// Set the display property in state from the dropdown element
  transactionTimeframeChange(event) {
    this.setState({
      displayTimeFrame: event.target.options[event.target.selectedIndex].value
    });
  }

  DownloadCSV() {
    //Analytics.GANALYTICS.SendEvent("Transactions","CSV",this.state.displayTimeFrame,1);

    this.saveCSV(this.returnAllFilters([...this.props.walletitems]));
  }

  /// Save CSV
  /// creates a CSV file then prompts the user to save that file
  /// Input :
  ///   DataToSave  || Object Array || Transactions to save
  saveCSV(DataToSave) {
    const rows = []; //Set up a blank array for each row

    let currencyValueLable = this.props.settings.fiatCurrency + " Value";

    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      "Number",
      "Account",
      "Address",
      "Amount",
      currencyValueLable,
      "BTC Value",
      "Type",
      "Time",
      "Transaction ID",
      "Confirmations",
      "Fee"
    ];
    rows.push(NameEntry);

    //Below: add a new data entry as a new row
    for (let i = 0; i < DataToSave.length; i++) {
      //Add each column here,
      let tempentry = [
        i + 1,
        DataToSave[i].account,
        DataToSave[i].address,
        DataToSave[i].amount,
        (
          DataToSave[i].amount *
          DataToSave[i].value[this.props.settings.fiatCurrency]
        ).toFixed(2),
        (DataToSave[i].amount * DataToSave[i].value.BTC).toFixed(8),
        DataToSave[i].category,
        DataToSave[i].time,
        DataToSave[i].txid,
        DataToSave[i].confirmations,
        DataToSave[i].fee
      ];
      rows.push(tempentry);
    }
    let csvContent = "data:text/csv;charset=utf-8,"; //Set formating
    rows.forEach(function(rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    }); //format each row

    let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nexus-transactions.csv"); //give link an action and a default name for the file. MUST BE .csv

    document.body.appendChild(link); // Required for FF

    link.click(); //Finish by "Clicking" this link that will execute the download action we listed above
    document.body.removeChild(link);
  }

  /// Transaction Type Filter Callback
  /// Callback for when you change the category filter
  transactiontypefiltercallback = e => {
    const catSearch = e.target.value;
    this.setState({
      categoryFilter: catSearch
    });
  };

  /// Transaction Amount Filter Callback
  /// Callback for when you change the amount filter
  transactionamountfiltercallback = e => {
    const amountFilterValue = e.target.value;
    this.setState({
      amountFilter: amountFilterValue
    });
  };

  /// Transaction Address Filter Callback
  /// Callback for when you change the address filter
  transactionaddressfiltercallback = e => {
    const addressfiltervalue = e.target.value;
    this.setState({
      addressFilter: addressfiltervalue
    });
  };

  /// Read AddressBook
  /// Taken From address page
  /// Return:
  ///   json || address in json format
  readAddressBook() {
    let json = null;
    try {
      json = config.ReadJson("addressbook.json");
    } catch (err) {
      json = {};
    }
    return json;
  }

  /// Filter By Category
  /// Filter the transactions based on the CategoryFilter
  filterByCategory(inTransactions) {
    let tempTrans = [];
    const categoryFilterValue = this.state.categoryFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];
      if (categoryFilterValue == "all") {
        tempTrans.push(element);
      } else {
        if (categoryFilterValue == element.category) {
          tempTrans.push(element);
        }
      }
    }
    return tempTrans;
  }

  /// Filter By Amount
  /// Filter the transactions based on the AmountFilter
  filterbyAmount(inTransactions) {
    let tempTrans = [];
    const amountFilterValue = this.state.amountFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];

      if (Math.abs(element.amount) >= amountFilterValue) {
        tempTrans.push(element);
      }
    }
    return tempTrans;
  }

  /// Filter By Address
  /// Filter the transactions based on the AddressFilter
  filterByAddress(inTransactions) {
    let tempTrans = [];
    const addressfiltervalue = this.state.addressFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];
      if (
        element.address.toLowerCase().includes(addressfiltervalue.toLowerCase())
      ) {
        tempTrans.push(element);
      }
    }
    return tempTrans;
  }

  /// Filter By Time
  /// Filter the transactions based on the DisplayTimeFrame
  filterByTime(inTransactions) {
    let tempTrans = [];
    const timeFilterValue = this.state.displayTimeFrame;
    let todaydate = new Date();
    let pastdate = null;

    if (timeFilterValue == "Week") {
      pastdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth(),
        todaydate.getDate() - 7
      );
    } else if (timeFilterValue == "Month") {
      pastdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth() - 1,
        todaydate.getDate()
      );
    } else if (timeFilterValue == "Year") {
      pastdate = new Date(
        todaydate.getFullYear() - 1,
        todaydate.getMonth(),
        todaydate.getDate()
      );
    } else {
      return inTransactions;
    }
    todaydate = Math.round(todaydate.getTime() / 1000);
    pastdate = Math.round(pastdate.getTime() / 1000);

    todaydate = todaydate + 10000;

    for (let index = 0; index < inTransactions.length; index++) {
      //just holding this to keep it clean
      const element = inTransactions[index];

      //Am I in the time frame provided
      if (element.time >= pastdate && element.time <= todaydate) {
        tempTrans.push(element);
      }
    }

    return tempTrans;
  }

  ///Return All Filter
  /// Returns all the transaction that have been filtered by the filter
  returnAllFilters(inTransactions) {
    let tempTrans = inTransactions;
    tempTrans = this.filterByTime(tempTrans);
    tempTrans = this.filterByCategory(tempTrans);
    tempTrans = this.filterByAddress(tempTrans);
    tempTrans = this.filterbyAmount(tempTrans);
    return tempTrans;
  }

  /// Temp Add Fack Transaction
  /// DEV MODE: Create a fake transaction for testing.
  TEMPaddfaketransaction() {
    let faketrans = {
      transactionnumber: this.props.walletitems.length,
      confirmations: 1000,
      time: 3432423,
      category: "",
      amount: Math.random() * 100,
      txid: "00000000000000000000000000000000000000000",
      account: "Random",
      address: "1111111111111111111111111111111",
      value: {
        USD: 1.9,
        BTC: 0.0003222
      },
      coin: "Nexus",
      fee: 0
    };
    let tempTransactionRandomCategory = function() {
      let temp = Math.ceil(Math.random() * 4);
      if (temp == 4) {
        return "send";
      } else if (temp == 1) {
        return "receive";
      } else if (temp == 2) {
        return "trust";
      } else {
        return "genesis";
      }
    };

    let tempTransactionRandomTime = function() {
      let start = new Date(2018, 3, 1);
      let end = new Date(2018, 7, 2);
      let randomtime = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      return randomtime.getTime() / 1000.0;
    };

    faketrans.category = tempTransactionRandomCategory();
    faketrans.time = tempTransactionRandomTime();
    faketrans.time = Math.round(faketrans.time);

    if (faketrans.category == "send") {
      faketrans.amount = faketrans.amount * -1;
    }

    return faketrans;
  }

  /// Table Select CallBack
  /// What happens when you select something in the table
  tableSelectCallback(e, indata) {
    console.log(e.target.innerText);
    console.log(indata);
    //e.target.select();
    //document.execCommand('copy');
    this.setState({
      hoveringID: indata.index
    });
  }

  /// Return Formated Table Data
  /// Return the data to be placed into the Table
  returnFormatedTableData() {
    if (this.props.walletitems == undefined) {
      return [];
    }
    const formatedData = this.returnAllFilters([...this.props.walletitems]);
    let txCounter = 0; // This is just to list out the transactions in order this is not apart of a transaction.
    return formatedData.map(ele => {
      txCounter++;
      let isPending = "";
      if (ele.confirmations <= 12) {
        isPending = "(Pending)";
      }
      return {
        transactionnumber: txCounter,
        time: ele.time,
        category: ele.category + isPending,
        amount: ele.amount,
        account: ele.account,
        address: ele.address
      };
    });
  }

  /// Return Table Columns
  /// Returns the columns and their rules/formats for the Table
  /// Output:
  ///   Array || Table Column array
  returnTableColumns() {
    let tempColumns = [];

    tempColumns.push({
      Header: "TX Number",
      accessor: "transactionnumber",
      maxWidth: 100
    });

    tempColumns.push({
      Header: "time",
      id: "time",
      Cell: d => <div> {new Date(d.value * 1000).toUTCString()} </div>, // We want to display the time in  a readable format
      accessor: "time",
      maxWidth: 200
    });

    tempColumns.push({
      Header: "category",
      accessor: "category",
      maxWidth: 100
    });

    tempColumns.push({
      Header: "amount",
      accessor: "amount",
      maxWidth: 100
    });

    tempColumns.push({
      Header: "account",
      accessor: "account",
      maxWidth: 150
    });

    tempColumns.push({
      Header: "address",
      accessor: "address"
    });
    return tempColumns;
  }

  /// Return Chart Data
  /// Returns formated data for the Victory Chart
  /// Output:
  ///    Array || Data Array
  returnChartData() {
    if (this.props.walletitems == undefined) {
      return [];
    }
    const filteredData = this.returnAllFilters([...this.props.walletitems]);
    return filteredData.map(ele => {
      return {
        a: new Date(ele.time * 1000),
        b: ele.amount,
        fill: "white",
        category: ele.category
      };
    });
  }

  /// Return Corrected Fill Color
  /// returns the correct fill color based on the category
  returnCorrectFillColor(inData) {
    if (inData.category == "receive") {
      return "#0ca4fb";
    } else if (inData.category == "send") {
      return "#035";
    } else {
      return "#fff";
    }
  }

  /// Return Correct Stoke Color
  /// Returns the Correct color based on the category
  returnCorrectStokeColor(inData) {
    if (inData.category == "receive") {
      return "#0ca4fb";
    } else if (inData.category == "send") {
      return "#035";
    } else {
      return "#fff";
    }
  }
  /// Return Tooltip Lable
  /// Returns the tooltip lable for the chart
  returnToolTipLable(inData) {
    return inData.category + "\nAmount: " + inData.b + "\nTime:" + inData.a;
  }

  /// Handle Zoom
  /// The event listener for when you zoom in and out
  handleZoom(domain) {
    domain.x[0] = new Date(domain.x[0]);
    domain.x[1] = new Date(domain.x[1]);
    let high = 0;
    let low = 0;
    this.props.walletitems.forEach(element => {
      if (
        element.time * 1000 >= domain.x[0] &&
        element.time * 1000 <= domain.x[1]
      ) {
        if (element.amount > high) {
          high = element.amount + 1;
        }

        if (element.amount < low) {
          low = element.amount - 1;
        }
      }
    });
    domain.y[0] = low;
    domain.y[1] = high;
    this.setState({ zoomDomain: domain });
  }

  /// Mouse Over Callback
  /// the callback for when you mouse over a transaction on the table.
  mouseOverCallback(e, inData) {
    this.setState({
      isHoveringOverTable: true
    });
  }
  /// Mouse Out Callback
  /// The call back for when the mouse moves out of the table div.
  mouseOutCallback(e) {
    this.setState({
      isHoveringOverTable: false
    });
  }

  /// Get History Data Json
  /// Either load in the file from local or start downloading more data and make a new one.
  gethistorydatajson() {
    let fs = require("fs");

    try {
      let appdataloc =
        process.env.APPDATA ||
        (process.platform == "darwin"
          ? process.env.HOME + "Library/Preferences"
          : process.env.HOME);
      appdataloc = appdataloc + "/.Nexus/";
      let incominghistoryfile = JSON.parse(
        fs.readFileSync(appdataloc + "historydata.json", "utf8")
      );
      let keys = Object.keys(incominghistoryfile);
      let newTempMap = new Map();
      keys.forEach(element => {
        newTempMap.set(Number(element), incominghistoryfile[element]);
      });
      this.setState({
        historyData: newTempMap
      });
    } catch (err) {}
  }

  /// Create Cryptocompare Url
  /// Helper method to create URL's quickly
  /// Input :
  ///   coinsym         || String || The symbol for the coin/fiat we are looking for MUST BE IN CAPS
  ///   timestamptolook || String || timestamp string ( in seconds) that will be the to var in looking up data
  createcryptocompareurl(coinsym, timestamptolook) {
    let tempurl =
      "https://min-api.cryptocompare.com/data/pricehistorical?fsym=NXS&tsyms=" +
      coinsym +
      "&ts=" +
      timestamptolook;
    return tempurl;
  }

  /// Set History Values On Transaction
  /// Build a object from incoming data then dispatch that to redux to populate that transaction
  /// Input:
  ///     timeID    || String || Timestamp
  ///     USDValue  || Float  || The value in USD
  ///     BTCValue  || Float  || The value in BTC
  setHistoryValuesOnTransaction(timeID, USDvalue, BTCValue) {
    let dataToChange = {
      time: timeID,
      value: {
        [this.props.settings.fiatCurrency]: USDvalue,
        BTC: BTCValue
      }
    };
    this.props.UpdateCoinValueOnTransaction(dataToChange);
  }

  /// Set Fee Values On Transaction
  /// Build a object from incoming data then dispatch that to redux to populate that transaction
  /// Input:
  ///     timeID    || String || Timestamp
  ///     feeValue  || Float  || The value of the send Fee
  setFeeValuesOnTransaction(timeID, feeValue) {
    let dataToChange = {
      time: timeID,
      fee: feeValue
    };
    this.props.UpdateFeeOnTransaction(dataToChange);
  }

  /// Download History On Transaction
  /// Download both USD and BTC history on the incoming transaction
  /// Input:
  ///     inEle   || String || the timestamp of the transaction
  downloadHistoryOnTransaction(inEle) {
    if (this._isMounted == false) {
      return;
    }

    let USDurl = this.createcryptocompareurl(
      [this.props.settings.fiatCurrency],
      inEle
    );
    let BTCurl = this.createcryptocompareurl("BTC", inEle);

    rp(USDurl).then(payload => {
      let incomingUSD = JSON.parse(payload);

      setTimeout(() => {
        if (this._isMounted == false) {
          return;
        }
        rp(BTCurl).then(payload2 => {
          if (this._isMounted == false) {
            return;
          }
          let incomingBTC = JSON.parse(payload2);

          this.setHistoryValuesOnTransaction(
            inEle,
            incomingUSD["NXS"][[this.props.settings.fiatCurrency]],
            incomingBTC["NXS"]["BTC"]
          );
          let tempHistory = this.state.historyData;
          if (this.state.historyData.has(inEle)) {
            tempHistory.set(inEle, {
              ...this.state.historyData.get(inEle),
              [this.props.settings.fiatCurrency]:
                incomingUSD["NXS"][[this.props.settings.fiatCurrency]],
              BTC: incomingBTC["NXS"]["BTC"]
            });
          } else {
            tempHistory.set(inEle, {
              [this.props.settings.fiatCurrency]:
                incomingUSD["NXS"][[this.props.settings.fiatCurrency]],
              BTC: incomingBTC["NXS"]["BTC"]
            });
          }
          this.setState({
            historyData: tempHistory,
            needsHistorySave: true
          });
        });
      }, 500);
    });
  }

  /// Go Through Data That needs It
  /// Go through all the data points that need to download new data a execute that promise
  gothroughdatathatneedsit() {
    let historyPromiseList = [];
    for (
      let index = 0;
      index < this.state.transactionsToCheck.length;
      index++
    ) {
      let daylayaction = new Promise((resolve, reject) => {
        if (this._isMounted == false) {
          reject();
        }
        setTimeout(resolve, 500 * index);
      });
      const element = this.state.transactionsToCheck[index];
      daylayaction.then(() => this.downloadHistoryOnTransaction(element));
    }

    if (this.state.transactionsToCheck.length != 0) {
      setTimeout(() => {
        this.SaveHistoryDataToJson();
      }, this.state.transactionsToCheck.length * 1000 + 1000);
    }
  }

  /// Save History Data To Json
  /// Save the history data to a json file
  SaveHistoryDataToJson() {
    if (
      this.state.historyData.size == 0 ||
      this.state.needsHistorySave == false
    ) {
      return;
    }
    this.setState({
      needsHistorySave: false
    });
    let appdataloc =
      process.env.APPDATA ||
      (process.platform == "darwin"
        ? process.env.HOME + "Library/Preferences"
        : process.env.HOME);
    appdataloc = appdataloc + "/.Nexus/";

    let fs = require("fs");

    fs.writeFile(
      appdataloc + "historydata.json",
      JSON.stringify(this.mapToObject(this.state.historyData)),
      err => {
        if (err != null) {
          console.log(err);
        }
      }
    );
  }

  /// Map To Object
  /// Used to transform a Map to a Object so that we can save it to a json file
  /// http://embed.plnkr.co/oNlQQBDyJUiIQlgWUPVP/
  /// Based on code from http://2ality.com/2015/08/es6-map-json.html
  /// Input :
  ///   aMap    || Map || A map of the data
  /// Output :
  ///   Object  || A object that replaces the map but contains the same data.
  mapToObject(aMap) {
    let obj = Object.create(null);

    for (let [k, v] of aMap) {
      // We don’t escape the key '__proto__' which can cause problems on older engines
      if (v instanceof Map) {
        obj[k.toString()] = this.mapToObject(v); // handle Maps that have Maps as values
      } else {
        obj[k.toString()] = v; // calling toString handles case where map key is not a string JSON requires key to be a string
      }
    }
    return obj;
  }

  /// Find CLoses Data Point
  /// If you give this a timestamp it will find the closes timestamp to the nearest hour. And returns the object containing priceUSD and priceBTC
  /// Input :
  ///   intimestamp || String || Timestamp to look up
  /// Output :
  ///     Object || A object that contains priceUSD and priceBTC
  findclosestdatapoint(intimestamp) {
    let datatograb = this.state.historyData.get(Number(intimestamp));
    if (datatograb == undefined) {
      return undefined;
    } else {
      if (datatograb[[this.props.settings.fiatCurrency]] == undefined) {
        return undefined;
      } else {
        return datatograb;
      }
    }
  }

  /// Compare Data
  /// Compares a Data to a from Data and a To Data and returns a Bool
  /// Input :
  ///   indate    || Date || Date to check
  ///   starttime || Date || Date from
  ///   endtime   || Date || Date to
  /// Output :
  ///   Bool || Is this true or not
  comparedate(indate, starttime, endtime) {
    if (starttime <= indate && indate <= endtime) {
      return true;
    } else {
      return false;
    }
  }

  /// On Open Modal
  /// Fired when you attempt to open the modal
  onOpenModal = () => {
    this.setState({ open: true });
  };

  /// On Close Modal
  /// Fired when you attempt to open the modal
  onCloseModal = () => {
    this.setState({ open: false });
  };

  returnModalInternal() {
    let internalString = [];
    if (
      this.state.hoveringID != 999999999999 &&
      this.props.walletitems.length != 0
    ) {
      const selectedTransaction = this.props.walletitems[this.state.hoveringID];

      if (selectedTransaction.confirmations <= 12) {
        internalString.push(<a key="isPending">PENDING TRANSACTION</a>);
        internalString.push(<br key="br10" />);
      }

      internalString.push(
        <a key="modal_amount">{"Amount: " + selectedTransaction.amount}</a>
      );
      internalString.push(<br key="br2" />);
      if (selectedTransaction.category == "send")
      {
        internalString.push(
          <a key="modal_fee">{"Fee: " + selectedTransaction.fee}</a>
        );
        internalString.push(<br key="br11" />);
      }
      internalString.push(
        <a key="modal_time">
          {"Time: " +
            new Date(selectedTransaction.time * 1000).toLocaleString()}
        </a>
      );
      internalString.push(<br key="br3" />);
      internalString.push(
        <a key="modal_Account">{"Account: " + selectedTransaction.account}</a>
      );
      internalString.push(<br key="br4" />);
      internalString.push(
        <a key="modal_Confirms">
          {"Confirmations: " + selectedTransaction.confirmations}
        </a>
      );
      internalString.push(<br key="br5" />);
      internalString.push(
        <a style={{ overflowWrap: "normal" }} key="modal_BlockHash">
          {"Block Hash: " + this.state.highlightedBlockHash}
        </a>
      );
      internalString.push(<br key="br6" />);
      internalString.push(
        <a key="modal_BlockNumber">
          {"Block Number: " + this.state.highlightedBlockNum}
        </a>
      );
    }

    return internalString;
  }

  returnDefaultPageSize() {
    let defPagesize = 10;
    if (this.props.walletitems != undefined) {
      defPagesize = this.props.walletitems.length < 10 ? 0 : 10;
    } else {
      defPagesize = 10;
    }
    return defPagesize;
  }
  
  render() {
    const data = this.returnFormatedTableData();
    const columns = this.returnTableColumns();
    const VictoryZoomVoronoiContainer = createContainer("voronoi", "zoom");
    const open = this.state.open;
    const pageSize = this.returnDefaultPageSize();

    return (
      <div id="transactions" className="animated fadeIn">
      <textarea id="copyDiv" style={{height:"0px", width:"0px",visibility:"hidden"}} ref={(newelement) => this.textCopyArea = newelement} value={"this.state.copyBuffer"} ></textarea>
        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          classNames={{ modal: "modal" }}
        >
          <h2>Transaction Details</h2>

          {this.returnModalInternal()}
        </Modal>

        <h2>
          <img src={transactionsimg} className="hdr-img" />
          Transactions
        </h2>

        <div className="panel">
          <div id="transactions-chart">
            <VictoryChart
              width={this.state.mainChartWidth}
              height={this.state.mainChartHeight}
              scale={{ x: "time" }}
              style={{ parent: { overflow: "visible" } }}
              // theme={VictoryTheme.material}
              domainPadding={{ x: 30 }}
              // padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
              padding={{ top: 6, bottom: 6, left: 0, right: 0 }}
              containerComponent={
                <VictoryZoomVoronoiContainer
                  zoomDimension="x"
                  zoomDomain={this.state.zoomDomain}
                  onZoomDomainChange={this.handleZoom.bind(this)}
                />
              }
            >
              <VictoryBar
                style={{
                  data: {
                    fill: d => this.returnCorrectFillColor(d),
                    stroke: d => this.returnCorrectStokeColor(d),
                    fillOpacity: 0.85,
                    strokeWidth: 1
                  }
                }}
                labelComponent={
                  <VictoryTooltip
                    orientation={incomingProp => {
                      let internalDifference =
                        this.state.zoomDomain.x[1].getTime() -
                        this.state.zoomDomain.x[0].getTime();
                      internalDifference = internalDifference / 2;
                      internalDifference =
                        this.state.zoomDomain.x[0].getTime() +
                        internalDifference;
                      if (incomingProp.a.getTime() <= internalDifference) {
                        return "right";
                      } else {
                        return "left";
                      }
                    }}
                  />
                }
                labels={d => this.returnToolTipLable(d)}
                data={this.returnChartData()}
                x="a"
                y="b"
              />

              <VictoryAxis
                // label="Time"
                independentAxis
                style={{
                  axis: { stroke: "var(--border-color)", strokeOpacity: 1 },
                  axisLabel: { fontSize: 16 },
                  grid: { stroke: "var(--border-color)", strokeOpacity: 0.25 },
                  ticks: {
                    stroke: "var(--border-color)",
                    strokeOpacity: 0.75,
                    size: 10
                  },
                  tickLabels: { fontSize: 11, padding: 5, fill: "#bbb" }
                }}
              />

              <VictoryAxis
                // label="Amount"
                dependentAxis
                style={{
                  axis: { stroke: "var(--border-color)", strokeOpacity: 1 },
                  axisLabel: { fontSize: 16 },
                  grid: { stroke: "var(--border-color)", strokeOpacity: 0.25 },
                  ticks: {
                    stroke: "var(--border-color)",
                    strokeOpacity: 0.75,
                    size: 10
                  },
                  tickLabels: { fontSize: 11, padding: 5, fill: "#bbb" }
                }}
              />
            </VictoryChart>
          </div>

          <div id="transactions-filters">
            <div id="filter-address" className="filter-field">
              <label htmlFor="address-filter">Search Address</label>
              <input
                id="address-filter"
                type="search"
                name="addressfilter"
                onChange={this.transactionaddressfiltercallback}
              />
            </div>

            <div id="filter-type" className="filter-field">
              <label htmlFor="transactiontype-dropdown">Type</label>
              <select
                id="transactiontype-dropdown"
                onChange={this.transactiontypefiltercallback}
              >
                <option value="all">All</option>
                <option value="receive">Receive</option>
                <option value="send">Sent</option>
                <option value="genesis">Genesis</option>
                <option value="trust">Trust</option>
              </select>
            </div>

            <div id="filter-minimum" className="filter-field">
              <label htmlFor="minimum-nxs">Min Amount</label>
              <input
                id="minimum-nxs"
                type="number"
                min="0"
                placeholder="0.00"
                onChange={this.transactionamountfiltercallback}
              />
            </div>

            <div id="filter-timeframe" className="filter-field">
              <label htmlFor="transaction-timeframe">Time Span</label>
              <select
                id="transaction-timeframe"
                onChange={event => this.transactionTimeframeChange(event)}
              >
                <option value="All">All</option>
                <option value="Year">Past Year</option>
                <option value="Month">Past Month</option>
                <option value="Week">Past Week</option>
              </select>
            </div>

            <button
              id="download-cvs-button"
              className="button primary"
              value="Download"
              onClick={() => this.DownloadCSV()}
            >
              Download
            </button>
          </div>

          <div id="transactions-details">
            <Table
              key="table-top"
              data={data}
              columns={columns}
              minRows={pageSize}
              selectCallback={this.tableSelectCallback.bind(this)}
              defaultsortingid={1}
              onMouseOverCallback={this.mouseOverCallback.bind(this)}
              onMouseOutCallback={this.mouseOutCallback.bind(this)}
            />
          </div>
        </div>
      </div>
    );
  }
}

//not being used save for later
class CustomTooltip extends React.Component {
  render() {
    return (
      <g>
        <VictoryLabel {...this.props} />
        <VictoryTooltip {...this.props} orientation="right" />
      </g>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transactions);
