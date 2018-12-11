/*
  Title: Transactions Module
  Description:
  Last Modified by: Kendal Cormany
*/
// External Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { remote } from 'electron';
import Request from 'request';
import { Promise } from 'bluebird-lst';
import fs from 'fs';
import Modal from 'react-responsive-modal';
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
  Flyout,
} from 'victory';
import rp from 'request-promise';
import { FormattedMessage } from 'react-intl';

// Internal Global Dependencies
import Icon from 'components/common/Icon';
import Panel from 'components/common/Panel';
import WaitingText from 'components/common/WaitingText';
import { GetSettings } from 'api/settings.js';
import Table from 'scripts/utilities-react';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import ContextMenuBuilder from 'contextmenu';
import config from 'api/configuration';

// Internal Local Dependencies
import styles from './style.css';

// Images
import transactionIcon from 'images/transaction.sprite.svg';

import copy from 'copy-to-clipboard';
import { wrap } from 'module';

/* TODO: THIS DOESN'T WORK AS IT SHOULD, MUST BE SOMETHING WITH WEBPACK NOT RESOLVING CSS INCLUDES TO /node_modules properly */
// import "react-table/react-table.css"

/* TODO: THIS DOESN"T WORK EITHER, COULD BE DUE TO WEBPACK CONFIG FOR ExtractTextPlugin? */
//import tablestyles from "./react-table.css";

// Global variables
let tempaddpress = new Map();

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.transactions,
    ...state.common,
    ...state.overview,
    ...state.addressbook,
    ...state.settings,
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
  SetSelectedMyAccount: returnData => {
    dispatch({ type: TYPE.SET_SELECTED_MYACCOUNT, payload: returnData });
  },
  UpdateConfirmationsOnTransactions: returnData => {
    dispatch({ type: TYPE.UPDATE_CONFIRMATIONS, payload: returnData });
  },
  UpdateCoinValueOnTransaction: returnData => {
    dispatch({ type: TYPE.UPDATE_COINVALUE, payload: returnData });
  },
  UpdateFeeOnTransaction: returnData => {
    dispatch({ type: TYPE.UPDATE_FEEVALUE, payload: returnData });
  },
});

class Transactions extends Component {
  static contextTypes = {
    router: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.copyRef = element => {
      this.textCopyArea = element;
    };
    this.hoveringID = 999999999999;
    this.isHoveringOverTable = false;
    this.state = {
      walletTransactions: [
        {
          transactionnumber: 0,
          confirmations: 0,
          time: 0,
          category: '',
          amount: 0,
          txid: 0,
          account: '',
          address: '',
          value: {
            USD: 0,
            BTC: 0,
          },
          coin: 'Nexus',
          fee: 0,
        },
      ],
      tableColumns: [],
      displayTimeFrame: 'All',
      amountFilter: 0,
      categoryFilter: 'all',
      addressFilter: '',
      zoomDomain: {
        x: [
          new Date(
            new Date().getFullYear() - 1,
            new Date().getMonth(),
            new Date().getDate(),
            1,
            1,
            1,
            1
          ),
          new Date(),
        ],
        y: [0, 1],
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
        height: 200,
      },
      addressLabels: new Map(),
      refreshInterval: undefined,
      highlightedBlockNum: 'Loading',
      highlightedBlockHash: 'Loading',
      needsHistorySave: false,
      copyBuffer: '',
    };
  }

  // React Method (Life cycle hook)
  componentDidMount() {
    console.log(this.props.messages);
    this._isMounted = true;
    this.updateChartAndTableDimensions();
    this.props.googleanalytics.SendScreen('Transactions');

    this.gethistorydatajson();
    let myaddresbook = this.readAddressBook();
    if (myaddresbook != undefined) {
      for (let key in myaddresbook.addressbook) {
        const eachAddress = myaddresbook.addressbook[key];
        const primaryadd = eachAddress['notMine']['Primary'];
        if (primaryadd != undefined) {
          tempaddpress.set(primaryadd, key);
        }
        for (let addressname in eachAddress['notMine']) {
          tempaddpress.set(
            eachAddress['notMine'][addressname].address,
            eachAddress.name +
              "'s" +
              `${' '}` +
              this.props.messages['Footer.Address']
          );
        }
      }
    }
    for (let key in this.props.myAccounts) {
      for (let eachaddress in this.props.myAccounts[key].addresses) {
        tempaddpress.set(
          this.props.myAccounts[key].addresses[eachaddress],
          this.props.myAccounts[key].account
        );
      }
    }
    this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));

    let interval = setInterval(() => {
      this.getTransactionData(this.setConfirmationsCallback.bind(this));
    }, 60000);
    this.setState({
      refreshInterval: interval,
      addressLabels: tempaddpress,
    });

    this.updateChartAndTableDimensions = this.updateChartAndTableDimensions.bind(
      this
    );
    window.addEventListener(
      'resize',
      this.updateChartAndTableDimensions,
      false
    );

    this.transactioncontextfunction = this.transactioncontextfunction.bind(
      this
    );
    window.addEventListener(
      'contextmenu',
      this.transactioncontextfunction,
      false
    );
  }

  // React Method (Life cycle hook)
  componentDidUpdate(previousprops) {
    if (this.props.txtotal != previousprops.txtotal) {
      this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));
    }
    if (this.props.selectedAccount != previousprops.selectedAccount) {
      this.getTransactionData(this.setOnmountTransactionsCallback.bind(this));
    }
  }

  // React Method (Life cycle hook)
  componentWillUnmount() {
    this._isMounted = false;
    this.SaveHistoryDataToJson();
    clearInterval(this.state.refreshInterval);
    this.setState({
      refreshInterval: null,
    });
    window.removeEventListener('resize', this.updateChartAndTableDimensions);
    window.removeEventListener('contextmenu', this.transactioncontextfunction);
  }

  // The callback for when we want to update just the confirmations
  setConfirmationsCallback(incomingData) {
    this.props.UpdateConfirmationsOnTransactions(incomingData);
  }

  // The callback for the on Mount State
  setOnmountTransactionsCallback(incomingData) {
    let objectheaders = Object.keys(this.state.walletTransactions[0]);
    let tabelheaders = [];
    objectheaders.forEach(element => {
      tabelheaders.push({
        Header: element,
        accessor: element,
      });
    });

    this.props.SetWalletTransactionArray(incomingData);
    let tempZoomDomain = {
      x: [new Date(), new Date(new Date().getFullYear() + 1, 1, 1, 1, 1, 1, 1)],
      y: [0, 1],
    };
    if (incomingData != undefined && incomingData.length > 0) {
      tempZoomDomain = {
        x: [
          new Date(new Date(incomingData[0].time * 1000).getTime() - 43200000),
          new Date(
            new Date(
              (incomingData[incomingData.length - 1].time + 1000) * 1000
            ).getTime() + 43200000
          ),
        ],
        y: [-1, 1],
      };
    }
    //console.log(tempZoomDomain);
    this.setState(
      {
        tableColumns: tabelheaders,
        zoomDomain: tempZoomDomain,
      },
      () => this.handleZoom(this.state.zoomDomain)
    );
    // Just trying to give some space on this not important call
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
          transactionsToCheck: payload,
        });
        this.gothroughdatathatneedsit();
      });

      let feePromises = [];
      incomingData.forEach(element => {
        if (element.category == 'debit') {
          feePromises.push(RPC.PROMISE('gettransaction', [element.txid]));
        }
      });
      Promise.all(feePromises).then(payload => {
        let feeData = new Map();
        payload.map(element => {
          feeData.set(element.time, element.fee);
        });
        this.setFeeValuesOnTransaction(feeData);
      });
    }, 1000);
  }

  // Updates the height and width of the chart and table when you resize the window
  updateChartAndTableDimensions(event) {
    let chart = document.getElementById('transactions-chart');
    let filters = document.getElementById('transactions-filters');
    let details = document.getElementById('transactions-details');
    if (chart) {
      let parent = chart.parentNode;
      let parentHeight =
        parseInt(parent.clientHeight) -
        parseInt(
          window.getComputedStyle(parent, '').getPropertyValue('padding-top')
        ) -
        parseInt(
          window.getComputedStyle(parent, '').getPropertyValue('padding-bottom')
        );
      let filtersHeight =
        parseInt(filters.offsetHeight) +
        parseInt(
          window.getComputedStyle(filters, '').getPropertyValue('margin-top')
        ) +
        parseInt(
          window.getComputedStyle(filters, '').getPropertyValue('margin-bottom')
        );
      let chartHeight =
        parseInt(chart.offsetHeight) +
        parseInt(
          window.getComputedStyle(chart, '').getPropertyValue('margin-top')
        ) +
        parseInt(
          window.getComputedStyle(chart, '').getPropertyValue('margin-bottom')
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
          height: detailsHeight,
        },
      });
    }
  }

  // This is the method that is called when the user pressed the right click
  // Input:
  //   e || Event || Default Events given by the system for right click
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
        highlightedBlockHash: 'Loading',
        highlightedBlockNum: 'Loading',
        open: true,
      });

      if (this.props.walletitems[this.hoveringID].confirmations != 0) {
        RPC.PROMISE('gettransaction', [
          this.props.walletitems[this.hoveringID].txid,
        ]).then(payload => {
          RPC.PROMISE('getblock', [payload.blockhash]).then(payload2 => {
            this.setState({
              highlightedBlockHash: payload.blockhash,
              highlightedBlockNum: payload2.height,
            });
          });
        });
      }
    };
    moreDatailsCallback = moreDatailsCallback.bind(this);

    // Build out the context menu

    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: this.props.messages['transactions.MoreDetails'],
        click() {
          moreDatailsCallback();
        },
      })
    );

    let tablecopyaddresscallback = function() {
      if (this.hoveringID != 999999999999) {
        this.copysomethingtotheclipboard(
          this.props.walletitems[this.hoveringID].address
        );
      }
    };
    tablecopyaddresscallback = tablecopyaddresscallback.bind(this);

    let tablecopyamountcallback = function() {
      if (this.hoveringID != 999999999999) {
        this.copysomethingtotheclipboard(
          this.props.walletitems[this.hoveringID].amount
        );
      }
    };
    tablecopyamountcallback = tablecopyamountcallback.bind(this);

    let tablecopyaccountcallback = function() {
      if (this.hoveringID != 999999999999) {
        this.copysomethingtotheclipboard(
          this.props.walletitems[this.hoveringID].account
        );
      }
    };
    tablecopyaccountcallback = tablecopyaccountcallback.bind(this);

    transactiontablecontextmenu.append(
      new remote.MenuItem({
        label: this.props.messages['Settings.Copy'],
        submenu: [
          {
            label: this.props.messages['AddressBook.Address'],
            click() {
              tablecopyaddresscallback();
            },
          },
          {
            label: this.props.messages['AddressBook.Account'],

            click() {
              tablecopyaccountcallback();
            },
          },
          {
            label: this.props.messages['sendReceive.TableAmount'],
            click() {
              tablecopyamountcallback();
            },
          },
        ],
      })
    );

    // Additional Functions for the context menu

    let sendtoSendPagecallback = function() {
      this.props.SetSendAgainData({
        address: this.state.walletTransactions[this.hoveringID].address,
        account: this.state.walletTransactions[this.hoveringID].account,
        amount: this.state.walletTransactions[this.hoveringID].amount,
      });
      this.context.router.history.push('/SendRecieve');
    };
    //sendtoSendPagecallback = sendtoSendPagecallback.bind(this);

    let sendtoBlockExplorercallback = function() {
      this.props.SetExploreInfo({
        transactionId: this.state.walletTransactions[this.hoveringID].txid,
      });
      this.context.router.history.push('/BlockExplorer');
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

    if (this.isHoveringOverTable) {
      transactiontablecontextmenu.popup(remote.getCurrentWindow());
    } else {
      defaultcontextmenu.popup(remote.getCurrentWindow());
    }
  }

  // Input :
  //   instringtocopy      || String || String to copy
  copysomethingtotheclipboard(instringtocopy) {
    copy(instringtocopy);
  }

  // Gets all the data from each account held by the wallet
  getTransactionData(finishingCallback) {
    let incomingMyAccounts;
    let listedaccounts = [];
    let promisList = [];
    if (
      this.props.selectedAccount == 0 ||
      this.props.selectedAccount === undefined
    ) {
      incomingMyAccounts = this.props.myAccounts;
      promisList.push(RPC.PROMISE('listtransactions', ['*', 9999, 0]));
    } else {
      incomingMyAccounts = this.props.myAccounts[
        this.props.selectedAccount - 1
      ];
      listedaccounts.push(incomingMyAccounts.account);
      promisList.push(
        RPC.PROMISE('listtransactions', [incomingMyAccounts.account, 9999, 0])
      );
    }
    let tempWalletTransactions = [];

    let settingsCheckDev = require('api/settings.js').GetSettings();

    // If in Dev Mode add some random transactions
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
      console.log(payload);
      payload.forEach(element => {
        for (let index = 0; index < element.length; index++) {
          const element2 = element[index];
          // if a move happend don't place it in the chart or table.
          if (element2.category === 'move') {
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
              BTC: 0,
            },
            coin: 'Nexus',
            fee: 0,
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

  // Set the display property in state from the dropdown element
  transactionTimeframeChange(event) {
    this.setState({
      displayTimeFrame: event.target.options[event.target.selectedIndex].value,
    });
  }

  DownloadCSV() {
    this.props.googleanalytics.SendEvent(
      'Transaction',
      'Data',
      'Download CSV',
      1
    );
    this.saveCSV(this.returnAllFilters([...this.props.walletitems]));
  }

  // creates a CSV file then prompts the user to save that file
  // Input :
  //   DataToSave  || Object Array || Transactions to save
  saveCSV(DataToSave) {
    const rows = []; //Set up a blank array for each row

    let currencyValueLable = this.props.settings.fiatCurrency + ' Value';

    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      'Number',
      'Account',
      'Address',
      'Amount',
      currencyValueLable,
      'BTC Value',
      'Type',
      'Time',
      'Transaction ID',
      'Confirmations',
      'Fee',
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
        DataToSave[i].fee,
      ];
      rows.push(tempentry);
    }
    let csvContent = 'data:text/csv;charset=utf-8,'; //Set formating
    rows.forEach(function(rowArray) {
      let row = rowArray.join(',');
      csvContent += row + '\r\n';
    }); //format each row

    let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'nexus-transactions.csv'); //give link an action and a default name for the file. MUST BE .csv

    document.body.appendChild(link); // Required for FF

    link.click(); //Finish by "Clicking" this link that will execute the download action we listed above
    document.body.removeChild(link);
  }

  // Callback for when you change the category filter
  transactiontypefiltercallback = e => {
    const catSearch = e.target.value;
    this.setState({
      categoryFilter: catSearch,
    });
  };

  // Callback for when you change the amount filter
  transactionamountfiltercallback = e => {
    const amountFilterValue = e.target.value;
    this.setState({
      amountFilter: amountFilterValue,
    });
  };

  // Callback for when you change the address filter
  transactionaddressfiltercallback = e => {
    const addressfiltervalue = e.target.value;
    this.setState({
      addressFilter: addressfiltervalue,
    });
  };

  // Taken From address page
  // Return:
  //   json || address in json format
  readAddressBook() {
    let json = null;
    try {
      json = config.ReadJson('addressbook.json');
    } catch (err) {
      json = {};
    }
    return json;
  }

  // Filter the transactions based on the CategoryFilter
  filterByCategory(inTransactions) {
    let tempTrans = [];
    const categoryFilterValue = this.state.categoryFilter;

    for (let index = 0; index < inTransactions.length; index++) {
      const element = inTransactions[index];
      if (categoryFilterValue == 'all') {
        tempTrans.push(element);
      } else {
        if (categoryFilterValue == element.category) {
          tempTrans.push(element);
        }
      }
    }
    return tempTrans;
  }

  // Filter the transactions based on the AmountFilter
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

  // Filter the transactions based on the AddressFilter
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

  // Filter the transactions based on the DisplayTimeFrame
  filterByTime(inTransactions) {
    let tempTrans = [];
    const timeFilterValue = this.state.displayTimeFrame;
    let todaydate = new Date();
    let pastdate = null;

    if (timeFilterValue == 'Week') {
      pastdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth(),
        todaydate.getDate() - 7
      );
    } else if (timeFilterValue == 'Month') {
      pastdate = new Date(
        todaydate.getFullYear(),
        todaydate.getMonth() - 1,
        todaydate.getDate()
      );
    } else if (timeFilterValue == 'Year') {
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

  // Returns all the transaction that have been filtered by the filter
  returnAllFilters(inTransactions) {
    let tempTrans = inTransactions;
    tempTrans = this.filterByTime(tempTrans);
    tempTrans = this.filterByCategory(tempTrans);
    tempTrans = this.filterByAddress(tempTrans);
    tempTrans = this.filterbyAmount(tempTrans);
    return tempTrans;
  }

  // DEV MODE: Create a fake transaction for testing.
  TEMPaddfaketransaction() {
    let faketrans = {
      transactionnumber: this.props.walletitems.length,
      confirmations: 1000,
      time: 3432423,
      category: '',
      amount: Math.random() * 100,
      txid: '00000000000000000000000000000000000000000',
      account: 'Random',
      address: '1111111111111111111111111111111',
      value: {
        USD: 1.9,
        BTC: 0.0003222,
      },
      coin: 'Nexus',
      fee: 0,
    };
    let tempTransactionRandomCategory = function() {
      let temp = Math.ceil(Math.random() * 4);
      if (temp == 4) {
        return 'debit';
      } else if (temp == 1) {
        return 'credit';
      } else if (temp == 2) {
        return 'trust';
      } else {
        return 'genesis';
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

    if (faketrans.category == 'debit') {
      faketrans.amount = faketrans.amount * -1;
    }

    return faketrans;
  }

  // What happens when you select something in the table
  tableSelectCallback(e, indata) {
    //e.target.select();
    //document.execCommand('copy');
    //this.setState({
    //  hoveringID: indata.index
    //});
    this.hoveringID = indata.index;
  }

  // Return the data to be placed into the Table
  returnFormatedTableData() {
    if (this.props.walletitems == undefined) {
      return [];
    }
    const formatedData = this.returnAllFilters([...this.props.walletitems]);
    let txCounter = 0; // This is just to list out the transactions in order this is not apart of a transaction.
    return formatedData.map(ele => {
      txCounter++;
      let isPending = '';
      if (ele.confirmations <= this.props.settings.minimumconfirmations) {
        isPending = '(Pending)';
      }
      // if (ele.category === "send") {
      //   return (ele.category = this.props.messages[
      //     "transactions.Sent"
      //   ]);
      // }

      return {
        transactionnumber: txCounter,
        time: ele.time,
        category: ele.category + isPending,
        amount: ele.amount,
        account: ele.account,
        address: ele.address,
      };
    });
  }

  // Returns the columns and their rules/formats for the Table
  // Output:
  //   Array || Table Column array
  returnTableColumns() {
    var options = {
      month: 'short',
      weekday: 'short',
      year: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };
    let tempColumns = [];

    tempColumns.push({
      Header: (
        <FormattedMessage id="transactions.TX" defaultMessage="TX Number" />
      ),
      accessor: 'transactionnumber',
      maxWidth: 100,
    });

    tempColumns.push({
      Header: <FormattedMessage id="transactions.Time" defaultMessage="Time" />,
      id: 'time',
      Cell: d => (
        <div>
          {' '}
          {new Date(d.value * 1000).toLocaleString(
            this.props.settings.locale,
            options
          )}{' '}
        </div>
      ), // We want to display the time in  a readable format
      accessor: 'time',
      maxWidth: 200,
    });

    tempColumns.push({
      id: 'category',
      Cell: q => {
        if (q.value === 'debit') {
          return (
            <FormattedMessage id="transactions.Sent" defaultMessage="Sent" />
          );
        } else if (q.value === 'credit') {
          return (
            <FormattedMessage
              id="transactions.Receive"
              defaultMessage="Received"
            />
          );
        } else {
          return (
            <FormattedMessage
              id="transactions.Pending"
              defaultMessage="(Pending)"
            />
          );
        }
      },
      Header: (
        <FormattedMessage
          id="transactions.Category"
          defaultMessage="Catagory"
        />
      ),
      accessor: 'category',

      maxWidth: 100,
    });

    tempColumns.push({
      Header: (
        <FormattedMessage id="transactions.Amount" defaultMessage="Amount" />
      ),
      accessor: 'amount',
      maxWidth: 100,
    });

    tempColumns.push({
      Header: (
        <FormattedMessage id="transactions.Account" defaultMessage="Account" />
      ),
      accessor: 'account',
      maxWidth: 150,
    });

    tempColumns.push({
      Header: (
        <FormattedMessage id="transactions.Address" defaultMessage="Address" />
      ),
      accessor: 'address',
    });
    return tempColumns;
  }

  // Returns formated data for the Victory Chart
  // Output:
  //    Array || Data Array
  returnChartData() {
    if (this.props.walletitems == undefined) {
      return [];
    }
    const filteredData = this.returnAllFilters([...this.props.walletitems]);
    return filteredData.map(ele => {
      return {
        a: new Date(ele.time * 1000),
        b: ele.amount,
        fill: 'white',
        category: ele.category,
      };
    });
  }

  // returns the correct fill color based on the category
  returnCorrectFillColor(inData) {
    if (inData.category == 'credit') {
      return '#0ca4fb';
    } else if (inData.category == 'debit') {
      return '#035';
    } else {
      return '#fff';
    }
  }

  // Returns the Correct color based on the category
  returnCorrectStokeColor(inData) {
    if (inData.category == 'credit') {
      return '#0ca4fb';
    } else if (inData.category == 'debit') {
      return '#035';
    } else {
      return '#fff';
    }
  }

  // Returns the tooltip lable for the chart
  returnToolTipLable(inData) {
    var options = {
      month: 'short',
      weekday: 'short',
      year: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };

    if (inData.category == 'credit') {
      inData.category = this.props.messages['transactions.Receive'];
    } else if (inData.category == 'debit') {
      inData.category = this.props.messages['transactions.Sent'];
    }
    return (
      inData.category +
      `\n ${this.props.messages['transactions.AMOUNT']}` +
      inData.b +
      `\n ${this.props.messages['transactions.TIME']}` +
      inData.a.toLocaleString(this.props.settings.locale, options)
    );
  }

  // The event listener for when you zoom in and out
  handleZoom(domain) {
    //console.log(domain);
    domain.x[0] = new Date(domain.x[0]);
    domain.x[1] = new Date(domain.x[1]);

    if (
      domain.x[1].getTime() >
      this.props.walletitems[this.props.walletitems.length - 1]
    ) {
      //console.log("IM OUT");
    }
    let high = 0;
    let low = 0;
    this.props.walletitems.forEach(element => {
      if (
        element.time * 1000 >= domain.x[0] &&
        element.time * 1000 <= domain.x[1]
      ) {
        if (element.amount > high) {
          high = element.amount + element.amount * 0.3;
        }

        if (element.amount < low) {
          low = element.amount - 1;
        }
      }
    });
    domain.y[0] = low === 0 ? -0.001 : low;

    domain.y[0] = -high;
    domain.y[1] = high === 0 ? 0.00001 : high;
    //console.log(this.state);
    //console.log(domain);
    this.setState({ zoomDomain: domain });
  }

  // the callback for when you mouse over a transaction on the table.
  mouseOverCallback(e, inData) {
    this.isHoveringOverTable = true;
  }

  // The call back for when the mouse moves out of the table div.
  mouseOutCallback(e) {
    this.isHoveringOverTable = false;
  }

  // Either load in the file from local or start downloading more data and make a new one.
  gethistorydatajson() {
    try {
      let appdataloc =
        process.env.APPDATA ||
        (process.platform == 'darwin'
          ? process.env.HOME + 'Library/Preferences'
          : process.env.HOME);
      appdataloc = appdataloc + '/.Nexus/';
      let incominghistoryfile = JSON.parse(
        fs.readFileSync(appdataloc + 'historydata.json', 'utf8')
      );
      let keys = Object.keys(incominghistoryfile);
      let newTempMap = new Map();
      keys.forEach(element => {
        newTempMap.set(Number(element), incominghistoryfile[element]);
      });
      this.setState({
        historyData: newTempMap,
      });
    } catch (err) {}
  }

  // Helper method to create URL's quickly
  // Input :
  //   coinsym         || String || The symbol for the coin/fiat we are looking for MUST BE IN CAPS
  //   timestamptolook || String || timestamp string ( in seconds) that will be the to var in looking up data
  createcryptocompareurl(coinsym, timestamptolook) {
    let tempurl =
      'https://min-api.cryptocompare.com/data/pricehistorical?fsym=NXS&tsyms=' +
      coinsym +
      '&ts=' +
      timestamptolook;
    return tempurl;
  }

  // Build a object from incoming data then dispatch that to redux to populate that transaction
  // Input:
  //     timeID    || String || Timestamp
  //     USDValue  || Float  || The value in USD
  //     BTCValue  || Float  || The value in BTC
  setHistoryValuesOnTransaction(timeID, USDvalue, BTCValue) {
    let dataToChange = {
      time: timeID,
      value: {
        [this.props.settings.fiatCurrency]: USDvalue,
        BTC: BTCValue,
      },
    };
    this.props.UpdateCoinValueOnTransaction(dataToChange);
  }

  /// Set Fee Values On Transaction
  /// Build a object from incoming data then dispatch that to redux to populate that transaction
  /// Input:
  ///     incomingChangeData    || Array || Data that needs to be changed.
  setFeeValuesOnTransaction(incomingChangeData) {
    this.props.UpdateFeeOnTransaction(incomingChangeData);
  }

  // Download both USD and BTC history on the incoming transaction
  // Input:
  //     inEle   || String || the timestamp of the transaction
  downloadHistoryOnTransaction(inEle) {
    if (this._isMounted == false) {
      return;
    }
    let USDurl = this.createcryptocompareurl(
      [this.props.settings.fiatCurrency],
      inEle
    );
    let BTCurl = this.createcryptocompareurl('BTC', inEle);
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
            incomingUSD['NXS'][[this.props.settings.fiatCurrency]],
            incomingBTC['NXS']['BTC']
          );
          let tempHistory = this.state.historyData;
          if (this.state.historyData.has(inEle)) {
            tempHistory.set(inEle, {
              ...this.state.historyData.get(inEle),
              [this.props.settings.fiatCurrency]:
                incomingUSD['NXS'][[this.props.settings.fiatCurrency]],
              BTC: incomingBTC['NXS']['BTC'],
            });
          } else {
            tempHistory.set(inEle, {
              [this.props.settings.fiatCurrency]:
                incomingUSD['NXS'][[this.props.settings.fiatCurrency]],
              BTC: incomingBTC['NXS']['BTC'],
            });
          }
          this.setState({
            historyData: tempHistory,
            needsHistorySave: true,
          });
        });
      }, 500);
    });
  }

  // Go through all the data points that need to download new data a execute that promise
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

  // Save the history data to a json file
  SaveHistoryDataToJson() {
    if (
      this.state.historyData.size == 0 ||
      this.state.needsHistorySave == false
    ) {
      return;
    }
    this.setState({
      needsHistorySave: false,
    });
    let appdataloc =
      process.env.APPDATA ||
      (process.platform == 'darwin'
        ? process.env.HOME + 'Library/Preferences'
        : process.env.HOME);
    appdataloc = appdataloc + '/.Nexus/';

    fs.writeFile(
      appdataloc + 'historydata.json',
      JSON.stringify(this.mapToObject(this.state.historyData)),
      err => {
        if (err != null) {
          console.log(err);
        }
      }
    );
  }

  // Used to transform a Map to a Object so that we can save it to a json file
  // http://embed.plnkr.co/oNlQQBDyJUiIQlgWUPVP/
  // Based on code from http://2ality.com/2015/08/es6-map-json.html
  // Input :
  //   aMap    || Map || A map of the data
  // Output :
  //   Object  || A object that replaces the map but contains the same data.
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

  // If you give this a timestamp it will find the closes timestamp to the nearest hour. And returns the object containing priceUSD and priceBTC
  // Input :
  //   intimestamp || String || Timestamp to look up
  // Output :
  //     Object || A object that contains priceUSD and priceBTC
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

  // Compares a Data to a from Data and a To Data and returns a Bool
  // Input :
  //   indate    || Date || Date to check
  //   starttime || Date || Date from
  //   endtime   || Date || Date to
  // Output :
  //   Bool || Is this true or not
  comparedate(indate, starttime, endtime) {
    if (starttime <= indate && indate <= endtime) {
      return true;
    } else {
      return false;
    }
  }

  // Fired when you attempt to open the modal
  onOpenModal() {
    this.setState({ open: true });
  }

  // Fired when you attempt to open the modal
  onCloseModal() {
    this.setState({ open: false });
  }

  returnModalInternal() {
    let internalString = [];
    if (this.hoveringID != 999999999999 && this.props.walletitems.length != 0) {
      const selectedTransaction = this.props.walletitems[this.hoveringID];
      if (selectedTransaction === undefined) {
        return;
      }
      if (
        selectedTransaction.confirmations <=
        this.props.settings.minimumconfirmations
      ) {
        internalString.push(
          <a key="isPending">
            <FormattedMessage
              id="transactions.PendingTransaction"
              defaultMessage="PENDING TRANSACTION"
            />
          </a>
        );
        internalString.push(<br key="br10" />);
      }

      internalString.push(
        <div key="modal_amount" className="detailCat">
          <FormattedMessage id="transactions.AMOUNT" defaultMessage="Amount" />
          <span className="TXdetails">{selectedTransaction.amount}</span>
        </div>
      );
      internalString.push(<br key="br2" />);
      if (selectedTransaction.category == 'debit') {
        internalString.push(
          <div key="modal_fee" className="detailCat">
            <FormattedMessage id="transactions.fee" defaultMessage="Fee" />:
            <span className="TXdetails">{+selectedTransaction.fee}</span>
          </div>
        );
        internalString.push(<br key="br11" />);
      }
      internalString.push(
        <div key="modal_time" className="detailCat">
          <FormattedMessage id="transactions.TIME" defaultMessage="Time" />
          <span className="TXdetails">
            {new Date(selectedTransaction.time * 1000).toLocaleString(
              this.props.settings.locale
            )}
          </span>
        </div>
      );
      internalString.push(<br key="br3" />);
      internalString.push(
        <div key="modal_Account" className="detailCat">
          <FormattedMessage id="AddressBook.Account" defaultMessage="Account" />
          :<span className="TXdetails">{selectedTransaction.account}</span>
        </div>
      );
      internalString.push(<br key="br4" />);
      internalString.push(
        <div key="modal_Confirms" className="detailCat">
          <FormattedMessage
            id="transactions.confirmations"
            defaultMessage="Confirmations"
          />
          :
          <span className="TXdetails">{selectedTransaction.confirmations}</span>
        </div>
      );
      internalString.push(<br key="br15" />);
      internalString.push(
        <div key="modal_TXID">
          <FormattedMessage
            id="transactions.modalTxID"
            defaultMessage="Transaction ID"
          />
          :
          <div className="blockHash" style={{ wordWrap: 'break-word' }}>
            <span>{selectedTransaction.txid}</span>
          </div>
        </div>
      );
      internalString.push(<br key="br6" />);
      internalString.push(
        <div key="modal_BlockNumber" className="detailCat">
          <FormattedMessage
            id="transactions.blocknumber"
            defaultMessage="Block Number"
          />
          :<span className="TXdetails">{this.state.highlightedBlockNum}</span>
        </div>
      );
      internalString.push(<br key="br5" />);
      internalString.push(
        <div key="modal_BlockHash">
          <FormattedMessage
            id="transactions.blockhash"
            defaultMessage="Block Hash"
          />
          :
          <div className="blockHash" style={{ wordWrap: 'break-word' }}>
            <span>{this.state.highlightedBlockHash}</span>
          </div>
        </div>
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

  accountChanger() {
    if (this.props)
      if (this.props.myAccounts[0]) {
        let tempMyAccounts = this.props.myAccounts.slice();
        tempMyAccounts.unshift({ account: 'All' });
        //console.log(tempAAAA);
        return tempMyAccounts.map((e, i) => {
          return (
            <option key={'account_select_' + e.account} value={i}>
              {e.account}
            </option>
          );
        });
      } else {
        return null;
      }
  }

  selectAccount(inAccount) {
    this.props.SetSelectedMyAccount(inAccount);
  }

  returnVictoryChart() {
    const VictoryZoomVoronoiContainer = createContainer('voronoi', 'zoom');
    return (
      <VictoryChart
        width={this.state.mainChartWidth}
        height={this.state.mainChartHeight}
        scale={{ x: 'time' }}
        style={{ parent: { overflow: 'visible' } }}
        // theme={VictoryTheme.material}
        domainPadding={{ x: 90, y: 30 }}
        // padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
        padding={{ top: 6, bottom: 6, left: 0, right: 0 }}
        domain={this.state.zoomDomain}
        containerComponent={
          <VictoryZoomVoronoiContainer
            voronoiPadding={10}
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
              strokeWidth: 1,
              fontSize: 3000,
            },
          }}
          labelComponent={
            <VictoryTooltip
              orientation={incomingProp => {
                let internalDifference =
                  this.state.zoomDomain.x[1].getTime() -
                  this.state.zoomDomain.x[0].getTime();
                internalDifference = internalDifference / 2;
                internalDifference =
                  this.state.zoomDomain.x[0].getTime() + internalDifference;
                if (incomingProp.a.getTime() <= internalDifference) {
                  return 'right';
                } else {
                  return 'left';
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
            axis: { stroke: 'var(--border-color)', strokeOpacity: 1 },
            axisLabel: { fontSize: 16 },
            grid: {
              stroke: 'var(--border-color)',
              strokeOpacity: 0.25,
            },
            ticks: {
              stroke: 'var(--border-color)',
              strokeOpacity: 0.75,
              size: 10,
            },
            tickLabels: { fontSize: 11, padding: 5, fill: '#bbb' },
          }}
        />

        <VictoryAxis
          // label="Amount"
          dependentAxis
          style={{
            axis: { stroke: 'var(--border-color)', strokeOpacity: 1 },
            axisLabel: { fontSize: 16 },
            grid: {
              stroke: 'var(--border-color)',
              strokeOpacity: 0.25,
            },
            ticks: {
              stroke: 'var(--border-color)',
              strokeOpacity: 0.75,
              size: 10,
            },
            tickLabels: { fontSize: 11, padding: 5, fill: '#bbb' },
          }}
        />
      </VictoryChart>
    );
  }

  // Mandatory React method
  render() {
    const data = this.returnFormatedTableData();
    const columns = this.returnTableColumns();
    const open = this.state.open;
    const pageSize = this.returnDefaultPageSize();
    return (
      <Panel
        icon={transactionIcon}
        title={
          <FormattedMessage
            id="transactions.Details"
            defaultMessage="Transaction Details"
          />
        }
      >
        <Modal
          open={open}
          onClose={this.onCloseModal.bind(this)}
          center
          classNames={{ modal: 'modal' }}
        >
          <h2 style={{ textAlign: 'center' }} />
          {this.returnModalInternal()}
        </Modal>

        {this.props.connections === undefined ? (
          <WaitingText>
            <FormattedMessage
              id="transactions.Loading"
              defaultMessage="Please wait for the daemon to load"
            />
            ...
          </WaitingText>
        ) : (
          <div>
            Account Select:
            <select
              id="select"
              value={this.props.selectedAccount}
              onChange={e => this.selectAccount(e.target.value)}
            >
              {this.accountChanger()}
            </select>{' '}
            <div
              id="transactions-chart"
              style={{ display: data.length === 0 ? 'none' : 'block' }}
            >
              {data.length === 0 ? null : this.returnVictoryChart()}
            </div>
            <div id="transactions-filters">
              <div id="filter-address" className="filter-field">
                <label htmlFor="address-filter">
                  <FormattedMessage
                    id="transactions.SearchAddress"
                    defaultMessage="Search Address"
                  />
                </label>
                <input
                  id="address-filter"
                  type="search"
                  name="addressfilter"
                  onChange={this.transactionaddressfiltercallback}
                />
              </div>

              <div id="filter-type" className="filter-field">
                <label htmlFor="transactiontype-dropdown">
                  <FormattedMessage
                    id="transactions.Type"
                    defaultMessage="TYPE"
                  />
                </label>
                <select
                  id="transactiontype-dropdown"
                  onChange={this.transactiontypefiltercallback}
                >
                  <option value="all">
                    <FormattedMessage
                      id="transactions.All"
                      defaultMessage="All"
                    />
                  </option>
                  <option value="credit">
                    <FormattedMessage
                      id="transactions.Receive"
                      defaultMessage="Receive"
                    />
                  </option>
                  <option value="debit">
                    <FormattedMessage
                      id="transactions.Sent"
                      defaultMessage="Sent"
                    />
                  </option>
                  <option value="genesis">
                    <FormattedMessage
                      id="transactions.Genesis"
                      defaultMessage="Genesis"
                    />
                  </option>
                  <option value="trust">
                    <FormattedMessage
                      id="transactions.Trust"
                      defaultMessage="Trust"
                    />
                  </option>
                </select>
              </div>

              <div id="filter-minimum" className="filter-field">
                <label htmlFor="minimum-nxs">
                  <FormattedMessage
                    id="transactions.MinimumAmount"
                    defaultMessage="Min Amount"
                  />
                </label>
                <input
                  id="minimum-nxs"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  onChange={this.transactionamountfiltercallback}
                />
              </div>

              <div id="filter-timeframe" className="filter-field">
                <label htmlFor="transaction-timeframe">
                  <FormattedMessage
                    id="transactions.Time"
                    defaultMessage="TIME SPAN"
                  />
                </label>
                <select
                  id="transaction-timeframe"
                  onChange={event => this.transactionTimeframeChange(event)}
                >
                  <option value="All">
                    <FormattedMessage
                      id="transactions.All"
                      defaultMessage="All"
                    />
                  </option>
                  <option value="Year">
                    <FormattedMessage
                      id="transactions.PastYear"
                      defaultMessage="All"
                    />
                  </option>
                  <option value="Month">
                    <FormattedMessage
                      id="transactions.PastMonth"
                      defaultMessage="Past Month"
                    />
                  </option>
                  <option value="Week">
                    <FormattedMessage
                      id="transactions.PastWeek"
                      defaultMessage="Past Week"
                    />
                  </option>
                </select>
              </div>

              <button
                id="download-cvs-button"
                className="button primary"
                value="Download"
                onClick={() => this.DownloadCSV()}
              >
                <FormattedMessage
                  id="transactions.Download"
                  defaultMessage="Download"
                />
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
        )}
      </Panel>
    );
  }
}

//not being used save for later
class CustomTooltip extends React.Component {
  // Mandatory React method
  render() {
    return (
      <g>
        <VictoryLabel {...this.props} />
        <VictoryTooltip {...this.props} orientation="right" />
      </g>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transactions);
