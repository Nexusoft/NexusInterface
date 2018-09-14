import React, { Component } from "react";
import { Link } from "react-router-dom";
import {connect} from "react-redux";
import {remote} from "electron";
import Request from "request";
import Table from "../../script/utilities-react";
import * as RPC from "../../script/rpc";
import { Promise } from "bluebird-lst";
import * as TYPE from "../../actions/actiontypes";
import Modal from 'react-responsive-modal';
import { VictoryBar, VictoryChart,VictoryLabel, VictoryStack, VictoryGroup, VictoryVoronoiContainer, VictoryAxis, VictoryTooltip,VictoryZoomContainer, VictoryBrushContainer, VictoryLine, VictoryTheme, createContainer, Flyout} from 'victory';
//import Analytics from "../../script/googleanalytics";

import transactionsimg from "../../images/transactions.svg";

import ContextMenuBuilder from "../../contextmenu";
import config from "../../api/configuration";

/* TODO: THIS DOESN'T WORK AS IT SHOULD, MUST BE SOMETHING WITH WEBPACK NOT RESOLVING CSS INCLUDES TO /node_modules properly */
// import "react-table/react-table.css"

/* TODO: THIS DOESN"T WORK EITHER, COULD BE DUE TO WEBPACK CONFIG FOR ExtractTextPlugin? */
//import tablestyles from "./react-table.css";
import styles from "./style.css";

let tempaddpress = new Map();

const mapStateToProps = state => {
  return { ...state.transactions, ...state.common, ...state.overview, ...state.addressbook };
};
const mapDispatchToProps = dispatch => ({
  SetWalletTransactionArray: returnData =>
  {
    dispatch({type:TYPE.SET_WALL_TRANS,payload:returnData})
  },
  SetSendAgainData: returnData =>
  {
    dispatch({type:TYPE.SET_TRANSACTION_SENDAGAIN,payload:returnData})
  },
  SetExploreInfo: returnData =>
  {
    dispatch({type:TYPE.SET_TRANSACTION_EXPLOREINFO,payload:returnData})
  }
});

class Transactions extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  };


  constructor(props)
  {
    super(props);
    this.state =
    {
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
      currentTransactions: [{transactionnumber: 0,
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
        fee: 0}],
      tableColumns: [],
      displayTimeFrame: "All",
      DataThisIsShowing: [{}],
      amountFilter: 0,
      categoryFilter: "all",
      addressFilter: "",
      zoomDomain: { x: [new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()), new Date()], y:[0,1] },
      isHoveringOverTable: false,
      hoveringID: 999999999999,
      open: false,
      exectuedHistoryData: false,
      historyData: new Map(),
      transactionsToCheck:[],
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
      highlightedBlockHash: "Loading"
    };
  }

  /// Component Did Mount
  /// Life cycle hook for page getting loaded
  componentDidMount() {

    
    this.updateChartAndTableDimensions();
    this.props.googleanalytics.SendScreen("Transactions");

    let myaddresbook = this.readAddressBook();
    if ( myaddresbook != undefined)
    {
      for (let key in myaddresbook.addressbook)
      {
        const eachAddress = myaddresbook.addressbook[key];
        const primaryadd = eachAddress["notMine"]["Primary"];
        if (primaryadd != undefined)
        {
          tempaddpress.set(primaryadd,key);
        }
        for (let addressname in eachAddress["notMine"])
        {
          tempaddpress.set(eachAddress["notMine"][addressname].address,eachAddress.name + "-" + eachAddress["notMine"][addressname].label);
        }
      }
    }
    for (let key in this.props.myAccounts)
    {
      for (let eachaddress in this.props.myAccounts[key].addresses)
      {
        tempaddpress.set(this.props.myAccounts[key].addresses[eachaddress],"My Address-" + this.props.myAccounts[key].account);
      }
    }
    this.loadMyAccounts();
    //console.log(tempaddpress);

    let interval = setInterval( () => {

      console.log("THIS IS THE INTERVAL WORKING");
       this.getTransactionData(false);
       },30000
      );
    this.setState(
      {
        refreshInterval: interval,
        addressLabels: tempaddpress
      }
    );

    this.updateChartAndTableDimensions = this.updateChartAndTableDimensions.bind(this);
    window.addEventListener('resize', this.updateChartAndTableDimensions, false);

    if (this.state.exectuedHistoryData == false)
    {
      this.setState(
        {
          exectuedHistoryData:true
        }
      );
    }

    
    this.transactioncontextfunction = this.transactioncontextfunction.bind(this);
    window.addEventListener("contextmenu", this.transactioncontextfunction, false);
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
          for (let key in accountsList)
          {
            for (let eachaddress in accountsList[key].addresses)
            {
              tempaddpress.set(accountsList[key].addresses[eachaddress],"My Account-" + accountsList[key].account);
            }
          }
          this.setState(
            {
              addressLabels: tempaddpress
            },() => { this.getTransactionData(true);}
          );
        });
      });
    });
  }

  /// Component Did Update
  /// Life cycle hook for prop update
  componentDidUpdate(previousprops) {
    if (this.props.txtotal != previousprops.txtotal) {
      this.getTransactionData(false);
    }
  }

  /// Component Will Unmount
   /// Life cycle hook for leaving the page
  componentWillUnmount()
  {
    window.removeEventListener('resize', this.updateChartAndTableDimensions);
    window.removeEventListener("contextmenu",this.transactioncontextfunction);
  }

  /// Update Chart and Table Dimensions
  /// Updates the height and width of the chart and table when you resize the window 
  updateChartAndTableDimensions(event) {

    let chart = document.getElementById("transactions-chart");
    let filters = document.getElementById("transactions-filters");
    let details = document.getElementById("transactions-details");
    let parent = chart.parentNode;

    let parentHeight = parseInt(parent.clientHeight) - parseInt(window.getComputedStyle(parent, '').getPropertyValue('padding-top')) - parseInt(window.getComputedStyle(parent, '').getPropertyValue('padding-bottom'));
    let filtersHeight = parseInt(filters.offsetHeight) + parseInt(window.getComputedStyle(filters, '').getPropertyValue('margin-top')) + parseInt(window.getComputedStyle(filters, '').getPropertyValue('margin-bottom'));
    let chartHeight = parseInt(chart.offsetHeight) + parseInt(window.getComputedStyle(chart, '').getPropertyValue('margin-top')) + parseInt(window.getComputedStyle(chart, '').getPropertyValue('margin-bottom'));
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
    }) 
  }

  /// Transaction Context Function
  /// This is the method that is called when the user pressed the right click 
  /// Input:
  ///   e || Event || Default Events given by the system for right click
  transactioncontextfunction(e) {
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
    
    const yuup = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(yuup);
    //create new custom
    let transactiontablecontextmenu = new remote.Menu();

    

    let moreDatailsCallback = function() {
        

      RPC.PROMISE("gettransaction",[this.props.walletitems[this.state.hoveringID].txid]).then (payload => 
        {console.log(payload)

          RPC.PROMISE("getblock",[payload.blockhash]).then(payload2 => {
            console.log(payload2);
            this.setState(
              {
                highlightedBlockHash: payload.blockhash,
                highlightedBlockNum: payload2.height
              }
            );
          });
        }
      );

        this.setState(
          {
            highlightedBlockHash: "Loading",
            highlightedBlockNum: "Loading",
            open:true
          }
        )


    }
    moreDatailsCallback = moreDatailsCallback.bind(this);



    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: "More Details",
        click() {
          moreDatailsCallback();
        }
      })
    );

    let tablecopyaddresscallback = function () {
      this.copysomethingtotheclipboard(this.state.walletTransactions[this.state.hoveringID].address);
    }
    tablecopyaddresscallback = tablecopyaddresscallback.bind(this);
    
    let tablecopyamountcallback = function () {
      this.copysomethingtotheclipboard(this.state.walletTransactions[this.state.hoveringID].amount);
    }
    tablecopyamountcallback = tablecopyamountcallback.bind(this);

    let tablecopyaccountcallback = function () {
      this.copysomethingtotheclipboard(this.state.walletTransactions[this.state.hoveringID].account);
    }
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

    let sendtoSendPagecallback = function()
    {
      
      this.props.SetSendAgainData({
        address: this.state.walletTransactions[this.state.hoveringID].address,
        account: this.state.walletTransactions[this.state.hoveringID].account,
        amount: this.state.walletTransactions[this.state.hoveringID].amount
      });
      this.context.router.history.push('/SendRecieve');
    }
    sendtoSendPagecallback = sendtoSendPagecallback.bind(this);

    let sendtoBlockExplorercallback = function() {
      
      this.props.SetExploreInfo(
        {
          transactionId: this.state.walletTransactions[this.state.hoveringID].txid
        }
      );
      this.context.router.history.push('/BlockExplorer');
    }

    sendtoBlockExplorercallback = sendtoBlockExplorercallback.bind(this);

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
  copysomethingtotheclipboard(instringtocopy)
  {
    let tempelement = document.createElement("textarea");
    tempelement.value = instringtocopy;
    document.body.appendChild(tempelement);
    tempelement.select();
    document.execCommand('copy');
    document.body.removeChild(tempelement);
  }

  /// Get Transaction Data
  /// Gets all the data from each account held by the wallet
  getTransactionData(resetZoom)
  {
    RPC.PROMISE("listaccounts",[0]).then(payload =>
      {
        //console.log(payload);
        let listedaccounts = Object.keys(payload);
        let promisList = [];
        listedaccounts.forEach(element => {
          promisList.push(RPC.PROMISE("listtransactions",[element,9999,0]));
        });
        let tempWalletTransactions = [];

        let settingsCheckDev = require('../../api/settings.js').GetSettings();

        if (settingsCheckDev.devMode == true)
        {
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

          let objectheaders = Object.keys(this.state.walletTransactions[0]);
          let tabelheaders = [];
          objectheaders.forEach(element => {
            tabelheaders.push(
              {
                Header: element,
                accessor: element
              }
            );
          });

         
           if ( promisList == null || promisList == undefined || promisList.length == 0)
          {
            return;
          }
          
        Promise.all(promisList).then(payload =>
        {
          //console.log(payload);
          payload.forEach(element => {
            for (let index = 0; index < element.length; index++) {
              const element2 = element[index];
              // if a move happend don't place it in the chart or table. 
              if (element2.category === "move")
              {
                return;
              }
              const getLable = this.state.addressLabels.get(element2.address);
              
              let tempTrans = 
              {
                transactionnumber: index,
                confirmations: element2.confirmations,
                time: element2.time,
                category: element2.category,
                amount: element2.amount,
                txid: element2.txid,
                account: getLable,
                address: element2.address,
                value:
                {
                  USD:0,
                  BTC:0
                },
                coin: "Nexus",
                fee: 0
              }
              tempWalletTransactions.push(tempTrans);
             
            }

          });
          
          //console.log(tempWalletTransactions);
          tempWalletTransactions.sort((a,b) => {return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0);} ); 
          this.props.SetWalletTransactionArray(tempWalletTransactions);
          //console.log(tempWalletTransactions);
          
          let tempZoom = this.state.zoomDomain;

          if ( resetZoom == true)
          {
            tempZoom  = { x: [new Date(tempWalletTransactions[0].time * 1000), new Date((tempWalletTransactions[tempWalletTransactions.length - 1].time + 1000) * 1000)] };
          }

          //console.log(this.props.walletitems);
          this.setState(
            {
              tableColumns:tabelheaders,
              zoomDomain: tempZoom
            },() => {
              //console.log(this.props.walletitems);
              for (let index = 0; index < this.state.walletTransactions.length; index++) {
              //this.getDataorNewData(index);
            
              } 
            }
          );
          //this.forceUpdate();
          //this.gothroughdatathatneedsit();
        });
      }
    )
  }

  transactionTimeframeChange(event)
  {
    this.setState(
      {
        displayTimeFrame: event.target.options[event.target.selectedIndex].value
      }
    );
  }

  DownloadCSV()
  {
    //Analytics.GANALYTICS.SendEvent("Transactions","CSV",this.state.displayTimeFrame,1);

 
    this.saveCSV(this.returnAllFilters([...this.state.currentTransactions]));
  }

  /// Save CSV
  /// creates a CSV file then prompts the user to save that file 
  /// Input :
  ///   DataToSave  || Object Array || Transactions to save
  saveCSV(DataToSave) {
    const rows = []; //Set up a blank array for each row
    console.log(DataToSave);
    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      "Number",
      "Account",
      "Address",
      "Amount",
      "USD Value",
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
        (DataToSave[i].amount * DataToSave[i].value.USD).toFixed(2),
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
  transactiontypefiltercallback = (e) =>
  {
    console.log(e.target.value);
    const catSearch = e.target.value;
    this.setState(
      {
        categoryFilter: catSearch
      }
    );
  }

  /// Transaction Amount Filter Callback
  /// Callback for when you change the amount filter
  transactionamountfiltercallback = (e) =>
  {
    console.log(e.target.value);

    const amountFilterValue = e.target.value;
    this.setState(
      {
        amountFilter: amountFilterValue
      }
    );
  }

  /// Transaction Address Filter Callback
  /// Callback for when you change the address filter
  transactionaddressfiltercallback = (e) =>
  {
    console.log(e.target.value);
    const addressfiltervalue = e.target.value;
    this.setState(
      {
        addressFilter: addressfiltervalue
      }
    );
  }

  /// Read AddressBook
  /// Taken From address page
  /// Return:
  ///   json || address in json format
  readAddressBook()
  {
    let json = null;
    try {
      json = config.ReadJson("addressbook.json");
      
    } 
    catch (err) 
    {
      json = {};
    }
    return json;
  }

  /// Filter By Category
  /// Filter the transactions based on the CategoryFilter
  filterByCategory(inTransactions)
  {
    let tempTrans = [];
    const categoryFilterValue = this.state.categoryFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];
      if (categoryFilterValue == "all")
      {
        tempTrans.push(element);
      }
      else
      {
        if (categoryFilterValue == element.category)
        {
          tempTrans.push(element);
        }
      }
      
    }
    return tempTrans;
  }

  /// Filter By Amount
  /// Filter the transactions based on the AmountFilter
  filterbyAmount(inTransactions)
  {
    let tempTrans = [];
    const amountFilterValue = this.state.amountFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];

      if (Math.abs(element.amount) >= amountFilterValue)
      {
        tempTrans.push(element);
      }
    }
    return tempTrans;
  }

  /// Filter By Address
  /// Filter the transactions based on the AddressFilter
  filterByAddress(inTransactions)
  {
    let tempTrans = [];
    const addressfiltervalue = this.state.addressFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];
      if (element.address.toLowerCase().includes(addressfiltervalue.toLowerCase()))
      {
        tempTrans.push(element);
      }

    }
    return tempTrans;
  }

  /// Filter By Time
  /// Filter the transactions based on the DisplayTimeFrame
  filterByTime(inTransactions)
  {
    let tempTrans = [];
    const timeFilterValue = this.state.displayTimeFrame;
    let todaydate = new Date();
    let pastdate = null;

    if (timeFilterValue == "Week")
    {
      pastdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate() - 7);
    }
    else if (timeFilterValue == "Month")
    {
      pastdate = new Date(todaydate.getFullYear(), todaydate.getMonth() - 1, todaydate.getDate());
    }
    else if (timeFilterValue == "Year")
    {
      pastdate = new Date(todaydate.getFullYear() - 1, todaydate.getMonth(), todaydate.getDate());
    }
    else
    {
      return inTransactions;
    }
    todaydate = Math.round(todaydate.getTime() / 1000);
    pastdate = Math.round(pastdate.getTime() / 1000);

    todaydate = todaydate + 10000;

    for (let index = 0; index < inTransactions.length; index++) {
      //just holding this to keep it clean
      const element = inTransactions[index];
  
      //Am I in the time frame provided
      if ( (element.time >= pastdate) && (element.time <= todaydate) ) 
      {
       
        tempTrans.push(element);
      }
    }
   
    return tempTrans;
  }

  ///Return All Filter 
  /// Returns all the transaction that have been filtered by the filter
  returnAllFilters(inTransactions)
  {
    let tempTrans = inTransactions;
    tempTrans = this.filterByTime(tempTrans);
    tempTrans = this.filterByCategory(tempTrans);
    tempTrans = this.filterByAddress(tempTrans);
    tempTrans = this.filterbyAmount(tempTrans);
    return tempTrans;
  }

  /// Temp Add Fack Transaction
  /// DEV MODE: Create a fake transaction for testing. 
  TEMPaddfaketransaction()
  {
    let faketrans = 
    {
      transactionnumber: (this.props.walletitems.length),
      confirmations: 1000,
      time: 3432423,
      category:  "",
      amount: (Math.random()*100),
      txid: "00000000000000000000000000000000000000000",
      account: "Random",
      address: "1111111111111111111111111111111",
      value: {
        USD: 1.90,
        BTC: 0.0003222
      },
      coin: "Nexus",
      fee: 0
    }
    let tempTransactionRandomCategory = function() {
      
        let temp = Math.ceil(Math.random() * 4);
        if (temp == 4)
        {
          return "send";
        }
        else if (temp == 1)
        {
          return "receive";
        }
        else if (temp == 2)
        {
          return "trust";
        }
        else{
          return "genesis";
        }
      
    }

    let tempTransactionRandomTime = function()
    {
      let start = new Date(2018,3,1);
        let end = new Date(2018,7,2);
        let randomtime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomtime.getTime() / 1000.0;
    }

    faketrans.category = tempTransactionRandomCategory();
    faketrans.time = tempTransactionRandomTime();
    faketrans.time = Math.round(faketrans.time);

    if (faketrans.category == "send")
    {
      faketrans.amount = faketrans.amount * -1;
    }
    console.log(faketrans);
    return faketrans;
  

  }



  tryingsomething(e,indata)
  {
    //console.log(indata);
    //console.log("try");
    //Use this to debug.
    console.log(this); 
    this.setState(
      {
      hoveringID:indata.index
      }
    );
   // hoveringID:inData.index
  }

  /// Return Formated Table Data
  /// Return the data to be placed into the Table
  returnFormatedTableData()
  {
    if ( this.props.walletitems == undefined)
    {
      return [];
    }
    const formatedData = this.returnAllFilters([...this.props.walletitems]);
    let txCounter = 0; // This is just to list out the transactions in order this is not apart of a transaction.
    return formatedData.map((ele) =>
      {
        txCounter++;
        let isPending = "";
        if (ele.confirmations <= 12)
        {
          isPending = "(Pending)";
        }
        return {
                transactionnumber: (txCounter),
                time:ele.time,
                category: ele.category+isPending,
                amount: ele.amount,
                account: ele.account,
                address: ele.address,
        };
        
      });
  }

  /// Return Table Columns
  /// Returns the columns and their rules/formats for the Table
  /// Output:
  ///   Array || Table Column array 
  returnTableColumns()
  {
    let tempColumns = [];

    tempColumns.push(
      {
        Header: 'TX Number',
        accessor: 'transactionnumber',
        maxWidth: 100
      }
    );

    tempColumns.push(
      {
        Header: 'time',
        id: "time",
        Cell : d => <div> {(new Date(d.value * 1000)).toUTCString()} </div>, // We want to display the time in  a readable format
        accessor: "time",
        maxWidth: 200
      }
    );

    tempColumns.push(
      {
        Header: 'category',
        accessor: 'category',
        maxWidth: 100
      }
    );

    tempColumns.push(
      {
        Header: 'amount',
        accessor: 'amount',
        maxWidth: 100
      }
    );

    tempColumns.push(
      {
        Header: 'account',
        accessor: 'account',
        maxWidth: 150
      }
    );

    tempColumns.push(
      {
        Header: 'address',
        accessor: 'address'
      }
    );
    return tempColumns;
  }

  /// Return Chart Data 
  /// Returns formated data for the Victory Chart
  /// Output:
  ///    Array || Data Array
  returnChartData()
  {
    if ( this.props.walletitems == undefined)
    {
      return [];
    }
    const filteredData = this.returnAllFilters([...this.props.walletitems]);
    return filteredData.map((ele) =>
    {
      return{
        a:new Date(ele.time * 1000),
        b:ele.amount,
        fill: "white",
        category:ele.category
      }
    }
    );
  }

  /// Return Corrected Fill Color 
  /// returns the correct fill color based on the category
  returnCorrectFillColor(inData)
  {
    if (inData.category == "receive")
    {
      return "#0ca4fb";
    }
    else if (inData.category == "send")
    {
      return "#035";
    }
    else
    {
      return "#fff";
    }
  }

  /// Return Correct Stoke Color
  /// Returns the Correct color based on the category 
  returnCorrectStokeColor(inData)
  {
    if (inData.category == "receive")
    {
      return "#0ca4fb";
    }
    else if (inData.category == "send")
    {
      return "#035";
    }
    else
    {
      return "#fff";
    }
  }
  /// Return Tooltip Lable
  /// Returns the tooltip lable for the chart
  returnToolTipLable(inData)
  {
    return (inData.category + "\nAmount: " + inData.b + "\nTime:" + inData.a);
  }

  /// Handle Zoom
  /// The event listener for when you zoom in and out
  handleZoom(domain) {
    //console.log(domain);
    domain.x[0] = new Date(domain.x[0]);
    domain.x[1] = new Date(domain.x[1]);
    let high = 0;
    let low = 0;
    this.props.walletitems.forEach(element => {
      if ( (element.time * 1000 >= domain.x[0]) && (element.time * 1000 <= domain.x[1]))
      {
        if (element.amount > high)
        {
          high = element.amount + 1;

        }

        if (element.amount < low)
        {
          low = element.amount -1;
        }
      }
    });
    domain.y[0] = low;
    domain.y[1] = high;
    this.setState({ zoomDomain: domain });
  }

  /// Mouse Over Callback
  /// the callback for when you mouse over a transaction on the table. 
  mouseOverCallback(e, inData)
  {
    this.setState(
      {
        isHoveringOverTable:true

      }
    )
  }
  /// Mouse Out Callback
  /// The call back for when the mouse moves out of the table div. 
  mouseOutCallback(e)
  {
    this.setState(
      {
        isHoveringOverTable:false
      }
    )
  }

  /// Get History Data Json
  /// Either load in the file from local or start downloading more data and make a new one. 
  gethistorydatajson()
  {
    let fs = require('fs');

    try {
          let appdataloc = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME);
        appdataloc = appdataloc + "/.Nexus/";
        let incominghistoryfile = JSON.parse(fs.readFileSync(appdataloc + 'historydata.json', 'utf8'));
        let keys = Object.keys(incominghistoryfile);
        let newTempMap = new Map();
        keys.forEach(element => {
          newTempMap.set(Number(element),incominghistoryfile[element]);
        });
        this.setState(
          {
            historyData:newTempMap
          }
        );
        
    }
    catch (err) {
      //File is not found or corrupted, make a new one. 
      //onsole.log(err);
      this.getAllhourData();
    }
  }

  /// Create Cryptocompare Url
  /// Helper method to create URL's quickly
  /// Input :
  ///   coinsym         || String || The symbol for the coin/fiat we are looking for MUST BE IN CAPS 
  ///   timestamptolook || String || timestamp string ( in seconds) that will be the to var in looking up data
  createcryptocompareurl(coinsym, timestamptolook)
  {
    let tempurl = "https://min-api.cryptocompare.com/data/histohour?fsym=NXS&tsym=" + coinsym + "&limit=2000&toTs=" + timestamptolook;
    return tempurl;
  }

  /// Get All Hour Data
  /// Gather 2 years of data for a new history json file
  getAllhourData()
  {

    // We first have a download of data from may to the last known data that cryptocompare has data for. 
    // This is not great but we can only get data in 15 calls persecond so this is a good start. 
    let nowepoch = (Math.ceil(new Date(2018,5,8,10,25,25,500) /1000));
    let cryptocompareurl1 = this.createcryptocompareurl("USD",nowepoch);
    let cryptocompareurl8 = this.createcryptocompareurl("BTC",nowepoch);
    let cryptocompareurl2 = this.createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 1))))) ;
    let cryptocompareurl5 = this.createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 1))))) ;
    let cryptocompareurl3 = this.createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 2))))) ;
    let cryptocompareurl6 = this.createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 2))))) ;
    let cryptocompareurl4 = this.createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 3))))) ;
    let cryptocompareurl7 = this.createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 3))))) ;
    let cryptocompareurl9 = this.createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 4))))) ;
    let cryptocompareurl10 = this.createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 4))))) ;
    let cryptocompareurl11 = this.createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 5))))) ;
    let cryptocompareurl12 = this.createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 5))))) ;
    let cryptocompareurl13 = this.createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 6))))) ;
    let cryptocompareurl14 = this.createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 6))))) ;
    let promsiewait = new Promise(function(resolve, reject) {
      setTimeout(resolve, 1000);
    });

    
    //Call the promises and make a chain.
    this.createhistoricaldatapullpromise(cryptocompareurl1,'USD')
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl2,'USD'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl3,'USD'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl4,'USD'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl5,'BTC'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl6,'BTC'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl7,'BTC'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl8,'BTC'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl9,'USD'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl10,'BTC'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl11,'USD'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl12,'BTC'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl13,'USD'))
    .then(promsiewait)
    .then(this.createhistoricaldatapullpromise(cryptocompareurl14,'BTC'))
    .then(promsiewait);
  }
  

  /// Grab More History Data
  /// If more data is need give this a timestamp and troubled transaction then added to the history file
  /// Input :
  ///   intimestamp       || String || String Timestamp
  ///   trnsactionIndex   || Number || The index that needs more data
  grabmorehistorydata(intimestamp,transactionIndex)
  {
    //This locks from calling the api at the same time.
    TRANSACTIONS.gettingmoredata = true;
    console.log("NeededNewInfo");

    //Create the URL's 
    let cryptocompareurlUSD = createcryptocompareurl("USD",intimestamp);
    let cryptocompareurlBTC = createcryptocompareurl("BTC",intimestamp);

    
    //Get Both new USD and BTC Data
    this.createhistoricaldatapullpromise(cryptocompareurlUSD,'USD').
    then(data => {console.log(data);this.createhistoricaldatapullpromise(cryptocompareurlBTC,'BTC').
    then( data => {
      setTimeout(() => {
        console.log(this.state.historyData);
        //TRANSACTIONS.gettingmoredata = false;
        //TRANSACTIONS.getpriceattime(transactionIndex); //Now there is more data, process that transaction.
      })
    }); });

  }

  setnewdatafunction(body,tokentocompare)
    {
      let result = body;
      console.log(result);
      let previousDataFile = this.state.historyData;
      //For each point returned at it to the historydatamap.
      result["Data"].forEach(element => {
        let tempdataobj = {};
        let tempdataattribute = 'price' + tokentocompare;
        tempdataobj[tempdataattribute] = element["open"];
        let incomingelement = tempdataobj;

        Object.assign(incomingelement,previousDataFile.get(element["time"]));
        previousDataFile.set(element["time"],incomingelement);
      });
      this.setState(
        {
          historyData:previousDataFile
        }
      );
      console.log(this.state.historyData);
    };

    processHistoryReponse = function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(response["request"]["path"]);
        let symbolToLook;
        if ( response["request"]["path"].includes("USD",10) == true)
        {
          console.log("99999999999999");
          symbolToLook = "USD";
        }
        if ( response["request"]["path"].includes("BTC",10) == true)
        {
          console.log("0000000000000000000");
          symbolToLook = "BTC";
        }
          this.setnewdatafunction(body,symbolToLook);
      }
    }

    handleHistoryReQuest = function(resolve,reject,urltoask,tokentocomapre)
      {
        this.processHistoryReponse.bind(this);
       

        Request(
          {
            url: urltoask,
            json: true,

          },
          this.processHistoryReponse.bind(this)
        ).on("response",() => resolve(true));
       
      }

      handleHistoryReQuest = function(resolve,reject,urltoask,tokentocomapre)
    {


      this.historyProcessChain = this.historyProcessChain.bind(this);
            setTimeout(() => {
        
              this.historyProcessChain(resolve,reject,urltoask,tokentocomapre);

    }, 250 + Math.floor(Math.random() * 2000) );
    }

  /// Create History Data pull promise
  /// This will create and return a promise based on the cryptocompare url, and needs which coin to get info from (the api only accepts one coin at a time)
  /// Input :
  ///   urltoask        || String || URL to attach to this promise to look up
  ///   tokentocomapre  || String || Either 'USD' or 'BTC'
  /// Output :
  ///   Promise         || Promise to be executed
  createhistoricaldatapullpromise(urltoask, tokentocompare)
  {
     
    this.setnewdatafunction.bind(this);
    
    let internalpromise = new Promise((resolve,reject) => this.gjggjgjgj(resolve,reject,urltoask,tokentocompare));

    return internalpromise;
  }

  

  gothroughdatathatneedsit()
  {
    

    let historyPromiseList = [];
    for (let index = 0; index < this.state.transactionsToCheck.length; index++) {
      const element = this.state.transactionsToCheck[index];
      historyPromiseList.push({incomingIndex:element,this:this});
     
      
    }

    historyPromiseList.reduce((p, v) => p.then((otp) => this.generateHistoryPromise(v.this,v.incomingIndex,otp)), Promise.resolve()).then(() => {setTimeout(() => {
       this.afterHistoryPromiseProcessAndSave()
    }, 3000) });
  }

  generateHistoryPromise(incomingthis,incomingIndex,passthroughdata)
  {
    return new Promise(function(resolve, reject) {
   
      let founddata = incomingthis.findclosestdatapoint(incomingthis.state.walletTransactions[incomingIndex].time.toString());
      if(founddata == undefined)
      {
        
        
       // console.log(incomingthis);
        let cryptocompareurlUSD = incomingthis.createcryptocompareurl("USD",incomingthis.state.walletTransactions[incomingIndex].time);
        let cryptocompareurlBTC = incomingthis.createcryptocompareurl("BTC",incomingthis.state.walletTransactions[incomingIndex].time);

           let allpromise = [];
           allpromise.push( incomingthis.createhistoricaldatapullpromise(cryptocompareurlUSD,'USD'));
           allpromise.push(incomingthis.createhistoricaldatapullpromise(cryptocompareurlBTC,'BTC'));
            Promise.all(allpromise).then((ttttt) => {setTimeout(() => {
              console.log("********"); console.log(ttttt); resolve(ttttt);
            }, 1000) } );
            console.log("$$$$$$$$$$$$$$$$$$$$$$");
            setTimeout(() => {
              let ggggg = "true" + passthroughdata;
              console.log(ggggg)
            }, 2000);
          }
          else
          {
            console.log("Didn;t need more");
            let founddata = incomingthis.findclosestdatapoint(incomingthis.state.walletTransactions[incomingIndex].time.toString())
            let temp = incomingthis.state.walletTransactions;
            temp[incomingIndex].value.USD = founddata.priceUSD;
            temp[incomingIndex].value.BTC = founddata.priceBTC;
            incomingthis.setState(
              {
                walletTransactions:temp
              }
            );
            resolve(false);
          }
    });
  }
  
  returnIfFoundHistoryData(incomingIndex)
  {
    let founddata = this.findclosestdatapoint(this.props.walletitems[incomingIndex].time.toString());
    if(founddata == undefined)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  
  getDataorNewData(incomingIndex)
  {
    let founddata = this.findclosestdatapoint(this.props.walletitems[incomingIndex].time.toString());
    if(founddata == undefined)
    {
      let temp = this.state.transactionsToCheck;
      temp.push(incomingIndex);
      this.setState(
        {
          transactionsToCheck:temp
        }
      );

    }
    else
    {
      let tempwalletTrans = this.props.walletitems;
      tempwalletTrans[incomingIndex].value.USD = founddata.priceUSD;
      tempwalletTrans[incomingIndex].value.BTC = founddata.priceBTC;
      this.props.SetWalletTransactionArray(tempwalletTrans);
      
    }
  }

  afterHistoryPromiseProcessAndSave()
  {
    this.addhistorydatatoprevious();
    this.SaveHistoryDataToJson();
  }

  addhistorydatatoprevious()
  {
    let tempdata = this.props.walletitems;
    for (let index = 0; index < tempdata.length; index++) {
      let founddata = this.findclosestdatapoint(this.props.walletitems[index].time.toString());
      if ( founddata != undefined){
        tempdata[index].value.USD = founddata.priceUSD;
        tempdata[index].value.BTC = founddata.priceBTC;
      }
    }

   this.props.SetWalletTransactionArray(tempdata);
  }


  SaveHistoryDataToJson()
  {
    let appdataloc = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME);
    appdataloc = appdataloc + "/.Nexus/";
    console.log("Saving");
    let fs = require('fs');

    fs.writeFile(appdataloc + 'historydata.json', JSON.stringify(this.mapToObject(this.state.historyData)),(err) => {
      if (err != null){
          console.log(err);
          } 
      });
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
    console.log("Happen");
    for (let [k,v] of aMap) {
        // We don’t escape the key '__proto__' which can cause problems on older engines
        if (v instanceof Map) {
            obj[k.toString()] = this.mapToObject(v); // handle Maps that have Maps as values
        } else {
            obj[k.toString()] = v;              // calling toString handles case where map key is not a string JSON requires key to be a string
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
  findclosestdatapoint(intimestamp)
  {
    
    console.log(intimestamp);
    let modifiedtimestamp = intimestamp.substring(0,8);
    modifiedtimestamp += "00";
    console.log(modifiedtimestamp);
    let numberremainder = Number(modifiedtimestamp) % 3600;
    let datatograb; 

    console.log(numberremainder);

    datatograb = this.state.historyData.get((Number(modifiedtimestamp)  + numberremainder));

    

    if ( datatograb == undefined) 
    {
      datatograb = this.state.historyData.get((Number(modifiedtimestamp)  - numberremainder));
    } 
    console.log(datatograb);
    return datatograb;
  }

    

  /// Compare Data
  /// Compares a Data to a from Data and a To Data and returns a Bool
  /// Input :
  ///   indate    || Date || Date to check
  ///   starttime || Date || Date from
  ///   endtime   || Date || Date to
  /// Output :
  ///   Bool || Is this true or not 
  comparedate(indate, starttime, endtime)
  {
    console.log("In Time: " + indate + " StartTime: " + starttime + " EndTime: " + endtime);

    if (starttime <= indate && indate <= endtime)
    {
      return true;
    }
    else
    {
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

  returnModalInternal()
  {
    let internalString = [];
    if (this.state.hoveringID != 999999999999 && this.props.walletitems.length != 0){

      const selectedTransaction = this.props.walletitems[this.state.hoveringID];
      
        if (selectedTransaction.confirmations <= 12)
        {
          internalString.push(<a key="isPending">PENDING TRANSACTION</a>);
          internalString.push(<br key="br6"/>);
        }

      internalString.push(
          <a key="modal_amount">{"Amount: " + selectedTransaction.amount}</a>
        );
      internalString.push(<br key="br2"/>);
      internalString.push(
          <a key="modal_time">{"Time: " + (new Date(selectedTransaction.time * 1000)).toLocaleString()}</a>
        );
      internalString.push(<br key="br3"/>);
      internalString.push(
          <a key="modal_Account">{"Account: " + selectedTransaction.account}</a>
        );
      internalString.push(<br key="br4"/>);
      internalString.push(
          <a key="modal_Confirms">{"Confirmations: " + selectedTransaction.confirmations}</a>
        );
        internalString.push(<br key="br5"/>);
        internalString.push(
          <a style={{overflowWrap:"normal"}} key="modal_BlockHash">{"Block Hash: " + this.state.highlightedBlockHash}</a>
        );
        internalString.push(<br key="br6"/>);
        internalString.push(
          <a key="modal_BlockNumber">{"Block Number: " + this.state.highlightedBlockNum}</a>
        );
      
    }
   
    return internalString;
  }

  returnDefaultPageSize()
  {
    let defPagesize = 10;
    if (this.props.walletitems != undefined)
    {
      defPagesize =  (this.props.walletitems.length < 10) ? 0 : 10;
    }
    else
    {
      defPagesize =  10;
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

        <Modal open={open} onClose={this.onCloseModal} center classNames={{ modal: 'modal' }}>

          <h2>Transaction Details</h2>

          {this.returnModalInternal()}
        </Modal>

        <h2><img src={transactionsimg} className="hdr-img"/>Transactions</h2>

        <div className="panel">

          <div id="transactions-chart">

            <VictoryChart 
              width={this.state.mainChartWidth}
              height={this.state.mainChartHeight}
              scale={{ x: "time" }} 
              style={{ parent: { overflow: 'visible' }}}
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
                    fill: (d) => this.returnCorrectFillColor(d),
                    stroke: (d) => this.returnCorrectStokeColor(d),
                    fillOpacity: .85,
                    strokeWidth: 1
                  }
                }}
                labelComponent={<VictoryTooltip orientation={incomingProp => { 
                  
                  let internalDifference = this.state.zoomDomain.x[1].getTime() - this.state.zoomDomain.x[0].getTime();
                  internalDifference = internalDifference / 2;
                  internalDifference = this.state.zoomDomain.x[0].getTime() + internalDifference;
                  if (incomingProp.a.getTime() <= internalDifference )
                  {
                    return "right";
                  }
                  else
                  {
                    return "left";
                  }
                
                }} />}
                  labels={(d) => this.returnToolTipLable(d)}
                data={this.returnChartData()}
                x="a"
                y="b"
              />

              <VictoryAxis
                // label="Time"
                independentAxis
                style={{
                  axis: {stroke: "var(--border-color)", strokeOpacity: 1},
                  axisLabel: {fontSize: 16},
                  grid: {stroke: "var(--border-color)", strokeOpacity: .25},
                  ticks: {stroke: "var(--border-color)", strokeOpacity: .75, size: 10},
                  tickLabels: {fontSize: 11, padding: 5, fill: "#bbb"}
                }}
              />

              <VictoryAxis
                // label="Amount"
                dependentAxis
                style={{
                  axis: {stroke: "var(--border-color)", strokeOpacity: 1},
                  axisLabel: {fontSize: 16},
                  grid: {stroke: "var(--border-color)", strokeOpacity: .25},
                  ticks: {stroke: "var(--border-color)", strokeOpacity: .75, size: 10},
                  tickLabels: {fontSize: 11, padding: 5, fill: "#bbb"}
                }}
              />

            </VictoryChart>

          </div>

          <div id="transactions-filters">

            <div id="filter-address" className="filter-field">

              <label htmlFor="address-filter">Search Address</label>
              <input id="address-filter" type="search"  name="addressfilter" onChange={this.transactionaddressfiltercallback}/>

            </div>

            <div id="filter-type" className="filter-field">

                <label htmlFor="transactiontype-dropdown">Type</label>
                <select id="transactiontype-dropdown" onChange={this.transactiontypefiltercallback} >
                    <option value="all">All</option>
                    <option value="receive">Receive</option>
                    <option value="send">Sent</option>
                    <option value="genesis">Genesis</option>
                    <option value="trust">Trust</option> 
                </select>

            </div>

            <div id="filter-minimum" className="filter-field">

                <label htmlFor="minimum-nxs">Min Amount</label>
                <input id="minimum-nxs" type="number" min="0" placeholder="0.00" onChange={this.transactionamountfiltercallback}/>

            </div>

            <div id="filter-timeframe" className="filter-field">

              <label htmlFor="transaction-timeframe">Time Span</label>
              <select id="transaction-timeframe" onChange={(event) => this.transactionTimeframeChange(event)} >
                <option value="All">All</option>
                <option value="Year">Past Year</option>
                <option value="Month">Past Month</option>
                <option value="Week">Past Week</option>
              </select>

            </div>

            <button id="download-cvs-button" className="button primary" value="Download" onClick={() => this.DownloadCSV()} >Download</button> 

          </div>

          <div id="transactions-details">

            <Table key="table-top" data={data} columns={columns} minRows={pageSize} selectCallback={this.tryingsomething.bind(this)} defaultsortingid={1} onMouseOverCallback={this.mouseOverCallback.bind(this)} onMouseOutCallback={this.mouseOutCallback.bind(this)}/>

          </div>

        </div>

      </div>

    );
  }
}

//not being used save for later
class CustomTooltip extends React.Component {
  render() {
    console.log(this.props);
    return (
      <g>
        <VictoryLabel {...this.props}/>
        <VictoryTooltip
          {...this.props}
          orientation="right"
        />
      </g>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transactions);
