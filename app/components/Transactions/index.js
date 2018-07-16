import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import {connect} from "react-redux";
import {remote} from "electron";
import Table from "../../script/utilities-react";
import * as RPC from "../../script/rpc";
import { Promise } from "bluebird-lst";
import * as TYPE from "../../actions/actiontypes";
import Modal from 'react-responsive-modal';
import { VictoryBar, VictoryChart, VictoryStack, VictoryGroup, VictoryVoronoiContainer, VictoryAxis, VictoryTooltip,VictoryZoomContainer, VictoryBrushContainer, VictoryLine, VictoryTheme, createContainer} from 'victory';
//import Analytics from "../../script/googleanalytics";

const mapStateToProps = state => {
  return { ...state.transactions };
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
      open: false
    };
  }
  componentDidMount() {
    this.getTransactionData();


    
    
    console.log(window);
    console.log(remote);
    console.log(this);

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
    window.removeEventListener("contextmenu",this.transactioncontextfunction);
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

      //build default
      let defaultcontextmenu = remote.Menu.buildFromTemplate(template);
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
        TRANSACTIONS.TXIDtosearch =
        this.state.walletTransactions[this.state.hoveringID].txid;
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
              tempWalletTransactions.push(tempTrans);
            }

          });
          
          let objectheaders = Object.keys(tempWalletTransactions[0]);
          let tabelheaders = [];
          objectheaders.forEach(element => {
            tabelheaders.push(
              {
                Header: element,
                accessor: element
              }
            );
          });
          console.log(tempWalletTransactions);
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
          console.log(tempWalletTransactions);
          this.props.SetWalletTransactionArray(tempWalletTransactions);
          console.log(this.props.walletitems);
          this.setState(
            {
              walletTransactions:tempWalletTransactions,
              currentTransactions:tempWalletTransactions,
              tableColumns:tabelheaders,
              zoomDomain: { x: [new Date(tempWalletTransactions[0].time * 1000), new Date(tempWalletTransactions[tempWalletTransactions.length - 1].time * 1000)] }
            }
          );
          this.forceUpdate();
        });
      }
    )
  }

  DisplayPastWeek()
  {
    this.setState(
      {
        displayTimeFrame:"Week"
      }
    );
  }

  DisplayPastMonth()
  {
    this.setState(
      {
        displayTimeFrame:"Month"
      }
    );
  }

  DisplayPastYear()
  {
    this.setState(
      {
        displayTimeFrame:"Year"
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
    link.setAttribute("download", "my_data.csv"); //give link an action and a default name for the file. MUST BE .csv

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
        Header: 'transactionnumber',
        accessor: 'transactionnumber'
      }
    );

    tempColumns.push(
      {
        Header: 'time',
        accessor: 'time'
      }
    );

    tempColumns.push(
      {
        Header: 'category',
        accessor: 'category'
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
        accessor: 'account'
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
      return "green";
    }
    else if (inData.category == "send")
    {
      return "red";
    }
    else
    {
      return "gold";
    }
  }
  returnCorrectStokeColor(inData)
  {
    if (inData.category == "receive")
    {
      return "#047717";
    }
    else if (inData.category == "send")
    {
      return "#770303";
    }
    else
    {
      return "#775d03";
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
        keys.forEach(element => {
          TRANSACTIONS.HistoryDataMap.set(Number(element),incominghistoryfile[element]);
        });
    }
    catch (err) {
      //File is not found or corrupted, make a new one. 
      //onsole.log(err);
      getAllhourData();
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
    let cryptocompareurl1 = createcryptocompareurl("USD",nowepoch);
    let cryptocompareurl8 = createcryptocompareurl("BTC",nowepoch);
    let cryptocompareurl2 = createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 1))))) ;
    let cryptocompareurl5 = createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 1))))) ;
    let cryptocompareurl3 = createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 2))))) ;
    let cryptocompareurl6 = createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 2))))) ;
    let cryptocompareurl4 = createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 3))))) ;
    let cryptocompareurl7 = createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 3))))) ;
    let cryptocompareurl9 = createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 4))))) ;
    let cryptocompareurl10 = createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 4))))) ;
    let cryptocompareurl11 = createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 5))))) ;
    let cryptocompareurl12 = createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 5))))) ;
    let cryptocompareurl13 = createcryptocompareurl("USD",(Math.ceil(new Date(nowepoch - (7776000 * 6))))) ;
    let cryptocompareurl14 = createcryptocompareurl("BTC",(Math.ceil(new Date(nowepoch - (7776000 * 6))))) ;
    let promsiewait = new Promise(function(resolve, reject) {
      setTimeout(resolve, 1000);
    });
    
    
    let finishandsavefilepromise = new Promise(function(resolve, reject) {
      setTimeout(() => {
        console.log((Array.from(TRANSACTIONS.HistoryDataMap.keys())).length);
        let appdataloc = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME);
        appdataloc = appdataloc + "/.Nexus/";
    
        let fs = require('fs');
    
        fs.writeFile(appdataloc + 'historydata.json', JSON.stringify(mapToObject(TRANSACTIONS.HistoryDataMap)),(err) => {
          if (err != null){
              console.log(err);
              } 
          });
        resolve();
    
      }, 10000);
    });
    
    //Call the promises and make a chain.
    createhistoricaldatapullpromise(cryptocompareurl1,'USD')
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl2,'USD'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl3,'USD'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl4,'USD'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl5,'BTC'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl6,'BTC'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl7,'BTC'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl8,'BTC'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl9,'USD'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl10,'BTC'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl11,'USD'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl12,'BTC'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl13,'USD'))
    .then(promsiewait)
    .then(createhistoricaldatapullpromise(cryptocompareurl14,'BTC'))
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
    createhistoricaldatapullpromise(cryptocompareurlUSD,'USD').
    then(data => {console.log(data);createhistoricaldatapullpromise(cryptocompareurlBTC,'BTC').
    then( data => {
      setTimeout(() => {
        TRANSACTIONS.gettingmoredata = false;
        TRANSACTIONS.getpriceattime(transactionIndex); //Now there is more data, process that transaction.
      })
    }); });

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
    
    let internalpromise = new Promise(function(resolve, reject) {
      setTimeout(() => {
        

      TRANSACTIONS.request(
        {
          url: urltoask,
          json: true
        },
        function(error, response, body) {
          if (!error && response.statusCode === 200) {
            let result = body;
            //console.log(result);

            //For each point returned at it to the historydatamap.
            result["Data"].forEach(element => {
              let tempdataobj = {};
              let tempdataattribute = 'price' + tokentocompare;
              tempdataobj[tempdataattribute] = element["open"];
              let incomingelement = tempdataobj;
              Object.assign(incomingelement,TRANSACTIONS.HistoryDataMap.get(element["time"]));
              TRANSACTIONS.HistoryDataMap.set(element["time"],incomingelement);
              resolve(tokentocompare);
            });
          }
        }
      );
    }, 250 + Math.floor(Math.random() * 2000) ); // I just added this so there is a bit of seperation between calls. 
    });

    return internalpromise;
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
            obj[k.toString()] = mapToObject(v); // handle Maps that have Maps as values
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
    
        
    let modifiedtimestamp = intimestamp.substring(0,8);
    modifiedtimestamp += "00";
    let numberremainder = Number(modifiedtimestamp) % 3600;
    let datatograb; 

    datatograb = TRANSACTIONS.HistoryDataMap.get((Number(modifiedtimestamp)  + numberremainder));

    if ( datatograb == undefined) 
    {
      datatograb = TRANSACTIONS.HistoryDataMap.get((Number(modifiedtimestamp)  - numberremainder));
    } 

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
          <h2 key="modal_title"> TRANSACTIONS </h2>
        );
      internalString.push(<br key="br1"/>);
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
      <div style={{overflow:"auto",height:"800px"}} >
      <Modal open={open} onClose={this.onCloseModal} center classNames={{ modal: 'custom-modal' }}>
          {this.returnModalInternal()}
        </Modal>
        <h2>Transactions</h2>
        <div >
        <VictoryChart width={400} height={270} scale={{ x: "time" }} 
          theme={VictoryTheme.material}
          domainPadding={{ x: 15 }}
          padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
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
                  fillOpacity: 1,
                  strokeWidth: 1
                }
              }}
              labelComponent={<VictoryTooltip/>}
              labels={(d) => this.returnToolTipLable(d)}
              data={this.returnChartData()}
              x="a"
              y="b"
            />

          </VictoryChart>

          <VictoryChart
            padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
            width={600} height={50} scale={{ x: "time" }}
            theme={VictoryTheme.material}
            domainPadding={{ x: 15 }}
            containerComponent={
              <VictoryBrushContainer
                brushDimension="x"
                brushDomain={this.state.zoomDomain}
                brushStyle={{fill: "white", opacity: 0.4}}
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
          </VictoryChart>


      </div>
        <a id="timeshown">Time Displaying: {this.state.displayTimeFrame}</a> <br/>
        <button id="showpast-week-button" value="Show Past Week" onClick={() => this.DisplayPastWeek()}>Show Past Week </button>
        <button id="showpast-month-button" value="Show Past Month" onClick={() => this.DisplayPastMonth()} > Show Past Month </button>
        <button id="showpast-year-button" value="Show Past Year" onClick={() => this.DisplayPastYear()} > Show Past Year </button>
        <button id="showpast-all-button" value="Show All" onClick={() => this.setState({displayTimeFrame:"All"})} > Show All </button>
        <br/>
        <left>
            <a>Transaction Type</a> <select id="transactiontype-dropdown" onChange={this.transactiontypefiltercallback} >
                <option value="all">All</option>
                <option value="receive">receive</option>
                <option value="send">Sent</option>
                <option value="genesis">Genesis</option>
                <option value="trust">Trust</option> 
            </select>
            <a>Minimum Amount</a> <input id="minimum-nxs" type="number" min="0" onChange={this.transactionamountfiltercallback}/>
            <a>Search Address:</a><input id="address-filter" type="search"  name="addressfilter"   onChange={this.transactionaddressfiltercallback}/>
            <button id="download-cvs-button" value="Download CSV" onClick={() => this.DownloadCSV()} > Download CSV </button> 
        </left>

         <Table key="table-top" data={data} columns={columns} selectCallback={this.tryingsomething} defaultsortingid={1} onMouseOverCallback={this.mouseOverCallback.bind(this)} onMouseOutCallback={this.mouseOutCallback.bind(this)}/>
      </div>

    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transactions);
