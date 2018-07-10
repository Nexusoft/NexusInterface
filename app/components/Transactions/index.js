import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import Table from "../../script/utilities-react";
import * as RPC from "../../script/rpc";
import { Promise } from "bluebird-lst";
import { VictoryBar, VictoryChart, VictoryStack, VictoryGroup, VictoryVoronoiContainer, VictoryAxis, VictoryTooltip,VictoryZoomContainer, VictoryBrushContainer, VictoryLine, VictoryTheme, createContainer} from 'victory';
//import Analytics from "../../script/googleanalytics";

export default class Transactions extends Component {

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
      zoomDomain: { x: [new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()), new Date()] }
    };
  }
  componentDidMount() {
    this.getTransactionData();
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

  tryingsomething(e)
  {
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

    return (
      <div style={{overflow:"auto",height:"800px"}} >
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

         <Table key="table-top" data={data} columns={columns} selectCallback={this.tryingsomething} defaultsortingid={1}/>
      </div>

    );
  }
}
