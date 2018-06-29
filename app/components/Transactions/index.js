import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
//import Analytics from "../../script/googleanalytics";

export default class Transactions extends Component {

  constructor(props)
  {
    super(props);
    this.state =
    {
      displayTimeFrame: "Month",
      DataThisIsShowing: [{}]
    };
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

    let tempdata = [
      {
        account:4,
        address:"232321312",
        amount:1233,
        value:
        {
          USD:1,
          BTC:1
        },
        category:"asdsa",
        time:11231234,
        txid:"1232321123213",
        confirmations:123132,
        fee:1

      }
    ];
    this.setState(
      {
        DataThisIsShowing:tempdata
      }
    )
    this.saveCSV(tempdata);
  }

  /// Save CSV
  /// creates a CSV file then prompts the user to save that file 
  /// Input :
  ///   DataToSave  || Object Array || Transactions to save
  saveCSV(DataToSave) {
    const rows = []; //Set up a blank array for each row

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

  transactiontypefiltercallback()
  {

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
        <a id={"pagenum-" + ele}>
      {" " + ele + " "}
      </a>
      );
    });
  }

  clickprevious()
  {

  }

  clicknext()
  {

  }

  render() {
    return (
      <div>
        <h1>Transactions here.</h1>
        <a id="timeshown">Time Displaying: {this.state.displayTimeFrame}</a> <br/>
        <button id="showpast-week-button" value="Show Past Week" onClick={() => this.DisplayPastWeek()}>Show Past Week </button>
        <button id="showpast-month-button" value="Show Past Month" onClick={() => this.DisplayPastMonth()} > Show Past Month </button>
        <button id="showpast-year-button" value="Show Past Year" onClick={() => this.DisplayPastYear()} > Show Past Year </button>
        <br/>
        <left>
            <a>Transaction Type</a> <select id="transactiontype-dropdown" onChange={() => this.transactiontypefiltercallback()} >
                <option value="all">All</option>
                <option value="receive">receive</option>
                <option value="send">Sent</option>
                <option value="genesis">Genesis</option>
                <option value="trust">Trust</option> 
            </select>
            <a>Minimum Amount</a> <input id="minimum-nxs" type="number" />
            <a>Search Address:</a><input id="address-filter" type="search"  name="addressfilter" value="" />
            <button id="download-cvs-button" value="Download CSV" onClick={() => this.DownloadCSV()} > Download CSV </button> 
        </left>
        <div id="pagenumbers">
        <a id="prevhtml" onClick={() => this.clickprevious()}> &lt;&lt; Previous   </a>
        {this.returnPageDivs()}
        <a id="nexthtml" onClick={() => this.clicknext()}>   Next &gt;&gt; </a>
         </div>
      </div>

    );
  }
}
