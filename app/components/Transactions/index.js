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
import { VictoryBar, VictoryChart, VictoryStack, VictoryGroup, VictoryVoronoiContainer, VictoryAxis, VictoryTooltip,VictoryZoomContainer, VictoryBrushContainer, VictoryLine, VictoryTheme, createContainer} from 'victory';
//import Analytics from "../../script/googleanalytics";

import ContextMenuBuilder from "../../contextmenu";

/* TODO: THIS DOESN'T WORK AS IT SHOULD, MUST BE SOMETHING WITH WEBPACK NOT RESOLVING CSS INCLUDES TO /node_modules properly */
// import "react-table/react-table.css"

/* TODO: THIS DOESN"T WORK EITHER, COULD BE DUE TO WEBPACK CONFIG FOR ExtractTextPlugin? */
//import tablestyles from "./react-table.css";
import styles from "./style.css";


const mapStateToProps = state => {
  return { ...state.transactions, ...state.common };
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
      currentTransactions: [],
      tableColumns: [],
      displayTimeFrame: "All",
      DataThisIsShowing: [{}],
      amountFilter: 0,
      categoryFilter: "all",
      addressFilter: "",
      zoomDomain: { x: [new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()), new Date()] },
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
      }
    };
  }
  componentDidMount() {

    this.getTransactionData();
    this.updateChartAndTableDimensions();
    this.props.googleanalytics.SendScreen("Transactions");
    window.addEventListener('resize', this.updateChartAndTableDimensions.bind(this));

    if (this.state.exectuedHistoryData == false)
    {
      this.gethistorydatajson();
      this.setState(
        {
          exectuedHistoryData:true
        }
      );
    }
    
    console.log(window);
    console.log(remote);
    console.log(this);

    console.log(ContextMenuBuilder);
    console.log(new ContextMenuBuilder().defaultContext);
    this.transactioncontextfunction = this.transactioncontextfunction.bind(this);

    //Remove Previous vent
    //window.removeEventListener("contextmenu", REGISTRY.REGISTER.ContextMenu);
    //regester this event
    //REGISTRY.REGISTER.ContextMenu = transactioncontextfunction;
    //Add new listener
    window.addEventListener("contextmenu", this.transactioncontextfunction, false);
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.updateChartAndTableDimensions);

    window.removeEventListener("contextmenu",this.transactioncontextfunction);
  }

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
      
      console.log(this.state);
      const yuup = new ContextMenuBuilder().defaultContext;
      //build default
      let defaultcontextmenu = remote.Menu.buildFromTemplate(yuup);
      //create new custom
      let transactiontablecontextmenu = new remote.Menu();

      

      let moreDatailsCallback = function() {
          console.log("12121");
          console.log(this.state);
          this.setState(
            {
              open:true
            }
          )
          // openmoredetailmodal();
      }
      moreDatailsCallback = moreDatailsCallback.bind(this);



      transactiontablecontextmenu.append(
        new remote.MenuItem({
          label: "More Details",
          click() {
            moreDatailsCallback();
           // openmoredetailmodal();
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
      
      console.log(this);
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

      console.log(transactiontablecontextmenu);


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

      //Add Resending the transaction option
      transactiontablecontextmenu.append(
        new remote.MenuItem({
          label: "Send Again",
          click() {

            sendtoSendPagecallback();
            
          }
        })
      );
      //Add Open Explorer Option
      transactiontablecontextmenu.append(
        new remote.MenuItem({
          label: "Open Explorer",
          click() {
            sendtoBlockExplorercallback();
          }
        })
      );

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

  getTransactionData()
  {
    RPC.PROMISE("listaccounts",[0]).then(payload =>
      {
        console.log(payload);
        let listedaccounts = Object.keys(payload);
        let promisList = [];
        listedaccounts.forEach(element => {
          promisList.push(RPC.PROMISE("listtransactions",[element,9999,0]));
        });
        let tempWalletTransactions = [];
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

          this.setState(
          {
              tableColumns:tabelheaders,
              currentTransactions:tempWalletTransactions,
              zoomDomain: { x: [new Date(tempWalletTransactions[0].time * 1000), new Date(tempWalletTransactions[tempWalletTransactions.length - 1].time * 1000)] }
            
          });

           if ( promisList == null || promisList == undefined || promisList.length == 0)
          {
            return;
          }
        Promise.all(promisList).then(payload =>
        {
          console.log(payload);
          payload.forEach(element => {
            for (let index = 0; index < element.length; index++) {
              const element2 = element[index];
              // if a move happend don't place it in the chart or table. 
              if (element2.category === "move")
              {
                return;
              }
              let tempTrans = 
              {
                transactionnumber: index,
                confirmations: element2.confirmations,
                time: element2.time,
                category: element2.category,
                amount: element2.amount,
                txid: element2.txid,
                account: element2.account,
                address: element2.address,
                value:
                {
                  USD:0,
                  BTC:0
                },
                coin: "Nexus",
                fee: 0
              }
             
              let gothistorydata = this.findclosestdatapoint(tempTrans.time.toString());
              //tempTrans.value.USD = gothistorydata.priceUSD;
              //tempTrans.value.BTC = gothistorydata.priceBTC;
              console.log(this.findclosestdatapoint(tempTrans.time.toString())); 
              
              tempWalletTransactions.push(tempTrans);
             
            }

          });
          
          
          console.log(tempWalletTransactions);
          
          console.log(tempWalletTransactions);
          this.props.SetWalletTransactionArray(tempWalletTransactions);
          console.log(this.props.walletitems);
          this.setState(
            {
              walletTransactions:tempWalletTransactions,
              currentTransactions:tempWalletTransactions,
              tableColumns:tabelheaders,
              zoomDomain: { x: [new Date(tempWalletTransactions[0].time * 1000), new Date(tempWalletTransactions[tempWalletTransactions.length - 1].time * 1000)] }
            },() => {
              console.log(this.state.walletTransactions);
              for (let index = 0; index < this.state.walletTransactions.length; index++) {
              this.getDataorNewData(index);
            
              } 
            }
          );
          this.forceUpdate();
          this.gothroughdatathatneedsit();
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

  returnAllFilters(inTransactions)
  {
    let tempTrans = inTransactions;
    tempTrans = this.filterByTime(tempTrans);
    tempTrans = this.filterByCategory(tempTrans);
    tempTrans = this.filterByAddress(tempTrans);
    tempTrans = this.filterbyAmount(tempTrans);
    return tempTrans;
  }

  returnPageDivs()
  {
    let temppagenum = 5;
    let temppagenumarraya = [];
    for (let index = 0; index < temppagenum; index++) {
      
      temppagenumarraya.push(index);
      console.log("aaa");

    }
    return temppagenumarraya.map((ele) =>
    { 
      return (
        <a key={ele} id={"pagenum-" + ele}>
      {" " + ele + " "}
      </a>
      );
    });
  }


  TEMPaddfaketransaction()
  {
    let faketrans = 
    {
      transactionnumber: (this.state.walletTransactions.length),
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
    let hhhh = function() {
      
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

    let xxxx = function()
    {
      let start = new Date(2018,3,1);
        let end = new Date(2018,7,2);
        let yuuu = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return yuuu.getTime() / 1000.0;
    }

    faketrans.category = hhhh();
    faketrans.time = xxxx();
    faketrans.time = Math.round(faketrans.time);

    if (faketrans.category == "send")
    {
      faketrans.amount = faketrans.amount * -1;
    }
    console.log(faketrans);
    return faketrans;
  

  }

  clickprevious()
  {

  }

  clicknext()
  {
    console.log("next");
  }

  tryingsomething(e,indata)
  {
    console.log(indata);
    console.log("try");
  }

  returnFormatedTableData()
  {
    const aaaa = this.returnAllFilters([...this.state.currentTransactions]);
    let bbbb = 0;
    return aaaa.map((ele) =>
      {
        bbbb++;
        return {
                transactionnumber: bbbb,
                time: ele.time,
                category: ele.category,
                amount: ele.amount,
                account: ele.account,
                address: ele.address,
        };
        
      });
  }


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
        accessor: 'time',
        maxWidth: 150
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
        accessor: 'amount'
      }
    );

    tempColumns.push(
      {
        Header: 'account',
        accessor: 'account',
        maxWidth: 200
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

  returnChartData()
  {
    const aaaa = this.returnAllFilters([...this.state.currentTransactions]);
    return aaaa.map((ele) =>
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
  
  returnToolTipLable(inData)
  {
    return (inData.category + "\nAmount: " + inData.b + "\nTime:" + inData.a);
  }

  handleZoom(domain) {
    this.setState({ zoomDomain: domain });
  }

  mouseOverCallback(e, inData)
  {
    this.setState(
      {
        isHoveringOverTable:true,
        hoveringID:inData.index

      }
    )
  }

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
    
    let pppppp = function()
    {
      console.log((Array.from(this.state.historyData.keys())).length);
        let appdataloc = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME);
        appdataloc = appdataloc + "/.Nexus/";
    
        let fs = require('fs');
    
        fs.writeFile(appdataloc + 'historydata.json', JSON.stringify(this.mapToObject(this.state.historyData)),(err) => {
          if (err != null){
              console.log(err);
              } 
          });
    }

    pppppp = pppppp.bind(this);

    let eeeeee = function()
    {
      setTimeout(() => {
        console.log("777777777777777777");
        pppppp();
     
       }, 10000);
    }

    eeeeee = eeeeee.bind(this);
    
    let finishandsavefilepromise = new Promise(function(resolve, reject) {
     eeeeee();
    }.bind(this));
    finishandsavefilepromise = finishandsavefilepromise.bind(this);
    this.createhistoricaldatapullpromise.bind(this);
    
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
    .then(promsiewait)
    .then(finishandsavefilepromise);
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

    uuuuuuuuuu = function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(response["request"]["path"]);
        let iiiiiii;
        if ( response["request"]["path"].includes("USD",10) == true)
        {
          console.log("99999999999999");
          iiiiiii = "USD";
        }
        if ( response["request"]["path"].includes("BTC",10) == true)
        {
          console.log("0000000000000000000");
          iiiiiii = "BTC";
        }
          this.setnewdatafunction(body,iiiiiii);
          //resolve(iiiiiii);
        
        //jjjjjjjj(true);
      }
    }

    kfkfkfkfkfk = function(resolve,reject,urltoask,tokentocomapre)
      {
        this.uuuuuuuuuu.bind(this);
        let jjjjjjjj = resolve;

        Request(
          {
            url: urltoask,
            json: true,

          },
          this.uuuuuuuuuu.bind(this)
        ).on("response",() => resolve(true));
       
      }

      gjggjgjgj = function(resolve,reject,urltoask,tokentocomapre)
    {


      this.kfkfkfkfkfk = this.kfkfkfkfkfk.bind(this);
            setTimeout(() => {
        
              this.kfkfkfkfkfk(resolve,reject,urltoask,tokentocomapre);

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
     /*
    let setnewdatafunction = function(body)
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
    };
 */
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

    historyPromiseList.reduce((p, v) => p.then((otp) => this.generateHistoryPromise(v.this,v.incomingIndex,otp)), Promise.resolve()).then(() => this.afterHistoryPromiseProcessAndSave());
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
       // incomingthis.createhistoricaldatapullpromise(cryptocompareurlUSD,'USD').then( () => 
       // incomingthis.createhistoricaldatapullpromise(cryptocompareurlBTC,'BTC').then( () => 
        //  resolve(true)
        //));
           let allpromise = [];
           allpromise.push( incomingthis.createhistoricaldatapullpromise(cryptocompareurlUSD,'USD'));
           allpromise.push(incomingthis.createhistoricaldatapullpromise(cryptocompareurlBTC,'BTC'));
            Promise.all(allpromise).then((ttttt) => {console.log("********"); console.log(ttttt); resolve(ttttt);} );
            //.then(fooff => {console.log("daadada");})
            console.log("$$$$$$$$$$$$$$$$$$$$$$");
            setTimeout(() => {
              let ggggg = "true" + passthroughdata;
              console.log(ggggg)
              //resolve(ggggg);
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

  ttttttt(incomingIndex)
  {
    if (this.wwwwww(incomingIndex))
    {
      return false;
    }
    else
    {
      let founddata = this.findclosestdatapoint(this.state.walletTransactions[incomingIndex].time.toString())
      let temp = this.state.walletTransactions;
      temp[incomingIndex].value.USD = founddata.priceUSD;
      temp[incomingIndex].value.BTC = founddata.priceBTC;
      this.setState(
        {
          walletTransactions:temp
        }
      );
      return true;
    }
  }
  
  wwwwww(incomingIndex)
  {
    
    let founddata = this.findclosestdatapoint(this.state.walletTransactions[incomingIndex].time.toString());
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
    var that = this;
    //console.log(that);
    //console.log(this.state.walletTransactions);
    let founddata = this.findclosestdatapoint(this.state.walletTransactions[incomingIndex].time.toString());
    //console.log(founddata);
    if(founddata == undefined)
    {
     // console.log("!!!!!!!!!!!!!!!!!!!!!" + this.state.walletTransactions[incomingIndex]);
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
      let tempwalletTrans = this.state.walletTransactions;
      tempwalletTrans[incomingIndex].value.USD = founddata.priceUSD;
      tempwalletTrans[incomingIndex].value.BTC = founddata.priceBTC;
      that.setState(
        {
          walletTransactions:tempwalletTrans
        }
      );
      
    }
  }

  afterHistoryPromiseProcessAndSave()
  {
    this.addhistorydatatoprevious();
    this.SaveHistoryDataToJson();
  }

  addhistorydatatoprevious()
  {
    let tempdata = this.state.walletTransactions;
    for (let index = 0; index < tempdata.length; index++) {
      let founddata = this.findclosestdatapoint(this.state.walletTransactions[index].time.toString());
      tempdata[index].value.USD = founddata.priceUSD;
      tempdata[index].value.BTC = founddata.priceBTC;

    }

    this.setState(
    {
      walletTransactions:tempdata
    }
    );
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

  onOpenModal = () => {
    this.setState({ open: true });
  };

  onCloseModal = () => {
    this.setState({ open: false });
  };

  returnModalInternal()
  {
    let internalString = [];
    if (this.state.hoveringID != 999999999999){
      const selectedTransaction = this.state.walletTransactions[this.state.hoveringID];
      
      internalString.push(
          <a key="modal_amount">{"Amount: " + selectedTransaction.amount}</a>
        );
      internalString.push(<br key="br2"/>);
      internalString.push(
          <a key="modal_time">{"Time: " + selectedTransaction.time}</a>
        );
      internalString.push(<br key="br3"/>);
      internalString.push(
          <a key="modal_amount">{"Account: " + selectedTransaction.account}</a>
        );
      internalString.push(<br key="br4"/>);
      internalString.push(
          <a key="modal_amount">{"Confirmations: " + selectedTransaction.confirmations}</a>
        );
      
    }
   
    return internalString;
  }

  render() { 
    const data = this.returnFormatedTableData();
    const columns = this.returnTableColumns();
    const getBarData = () => {
      return [
        { x: new Date(1986, 1, 1), y: 2 },
        { x: new Date(1996, 1, 1), y: 3 },
        { x: new Date(2006, 1, 1), y: 5 },
        { x: new Date(2016, 1, 1), y: 4 }
      ];
    };
    const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");
    const open = this.state.open; 
   
    return (

      <div id="transactions">

        <Modal open={open} onClose={this.onCloseModal} center classNames={{ modal: 'modal' }}>

          <h2 >Transaction Details</h2>

          {this.returnModalInternal()}

        </Modal>

        <h2>Transactions</h2>

        <div className="panel">

          <div id="transactions-chart">

            <VictoryChart 
              width={this.state.mainChartWidth}
              height={this.state.mainChartHeight}
              scale={{ x: "time" }} 
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
                labelComponent={<VictoryTooltip/>}
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

            {/* <VictoryChart
              padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
              width={this.state.miniChartWidth}
              height={this.state.miniChartHeight}
              scale={{ x: "time" }}
              theme={VictoryTheme.material}
              domainPadding={{ x: 15 }}
              padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
              containerComponent={
                <VictoryBrushContainer
                  brushDimension="x"
                  brushDomain={this.state.zoomDomain}
                  brushStyle={{fill: "white", opacity: 0.1}}
                  onBrushDomainChange={this.handleZoom.bind(this)}
                />
              }
            >
              <VictoryAxis/>
              <VictoryBar
                style={{
                  data: { 
                    stroke: "tomato",
                    fill: (d) => this.returnCorrectFillColor(d),
                    }
                }}
                data={this.returnChartData()}
                x="a"
                y="b"
              />

            </VictoryChart> */}

          </div>

          <div id="transactions-filters">

            {/* <a id="timeshown">Time Displaying: {this.state.displayTimeFrame}</a> <br/> */}

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

            <Table 
            styles={this.state.tableHeight}
            key="table-top" data={data} columns={columns} selectCallback={this.tryingsomething} defaultsortingid={1} onMouseOverCallback={this.mouseOverCallback.bind(this)} onMouseOutCallback={this.mouseOutCallback.bind(this)}/>

          </div>

        </div>

      </div>

    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transactions);
