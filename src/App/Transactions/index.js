import React, { Component } from 'react';
import { connect } from 'react-redux';
import googleanalytics from 'scripts/googleanalytics';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import Select from 'components/Select';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Table from 'components/Table';
import rpc from 'lib/rpc';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'actions/overlays';
import { setTxsAccountFilter } from 'actions/ui';
import { isCoreConnected } from 'selectors';
import { autoUpdateTransactions } from 'lib/transactions';

import TransactionDetailsModal from './TransactionDetailsModal';
import CSVDownloadModal from './TransactionCSVDownloadModal';
import Filters from './Filters';
import {
  getFilteredTransactions,
  getTransactionsList,
  getAccountOptions,
  withFakeTxs,
} from './selectors';
import { isPending } from './utils';
import TransactionsChartModal from './TransactionsChartModal';
import CategoryCell from './CategoryCell';

import transactionIcon from 'images/transaction.sprite.svg';
import barChartIcon from 'images/bar-chart.sprite.svg';
import downloadIcon from 'images/download.sprite.svg';

const timeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const tableColumns = [
  {
    id: 'time',
    Header: __('Time'),
    accessor: 'time',
    Cell: cell => formatDateTime(cell.value * 1000, timeFormatOptions),
    width: 200,
  },
  {
    id: 'category',
    Header: __('CATEGORY'),
    accessor: 'category',
    Cell: cell => <CategoryCell transaction={cell.original} />,
    width: 120,
  },
  {
    id: 'amount',
    Header: __('AMOUNT'),
    accessor: 'amount',
    width: 100,
  },
  {
    id: 'account',
    Header: __('ACCOUNT'),
    accessor: 'account',
    width: 150,
  },
  {
    id: 'address',
    Header: __('ADDRESS'),
    accessor: 'address',
  },
];

const AccountSelect = styled(Select)({
  marginLeft: '1em',
  minWidth: 200,
  fontSize: 15,
});

const TransactionsLayout = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"filters" "table"',
  gridTemplateRows: 'min-content 1fr',
});

const TransactionsTable = styled(Table)({
  gridArea: 'table',
  fontSize: 14,
  overflow: 'auto',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  const {
    ui: {
      transactions: { account, addressQuery, category, minAmount, timeSpan },
    },
    transactions: { map },
    settings: { devMode, fakeTransactions, minConfirmations },
    myAccounts,
  } = state;
  const txList = getTransactionsList(map);
  const addFakeTxs = devMode && fakeTransactions;
  const allTransactions = addFakeTxs
    ? withFakeTxs(txList, state.myAccounts)
    : txList;

  return {
    filteredTransactions: getFilteredTransactions(
      allTransactions,
      account,
      addressQuery,
      category,
      minAmount,
      timeSpan
    ),
    account,
    accountOptions: getAccountOptions(myAccounts),
    settings: state.settings,
    minConfirmations,
    coreConnected: isCoreConnected(state),
  };
};
const actionCreators = {
  openModal,
  setTxsAccountFilter,
};

/**
 * Transactions Page
 *
 * @class Transactions
 * @extends {Component}
 */
class Transactions extends Component {
  /**
   * Component Mount Callback
   *
   * @memberof Transactions
   */
  componentDidMount() {
    const { coreConnected, filteredTransactions } = this.props;
    if (coreConnected && !filteredTransactions) {
      autoUpdateTransactions();
    }
  }

  /**
   * Component Updated Props Callback
   *
   * @param {*} previousprops
   * @returns
   * @memberof Transactions
   */
  componentDidUpdate() {
    const { coreConnected, filteredTransactions } = this.props;
    if (coreConnected && !filteredTransactions) {
      autoUpdateTransactions();
    }
  }

  /**
   * Download CSV
   *
   * @memberof Transactions
   */
  DownloadCSV() {
    if (this.state.CSVProgress > 0) {
      // If your already running then don't try and run again
      return;
    }

    this.props.openModal(CSVDownloadModal, {
      parent: this.setCSVEvents.bind(this),
      progress: this.state.CSVProgress,
    });
    this.gatherAllFeeData();
  }

  /**
   * Gather All fee data for every debit/send transaction
   *
   * @memberof Transactions
   */
  async gatherAllFeeData() {
    let feePromises = [];
    let numberOfSends = 0;
    let feeData = new Map();

    this.props.walletitems.forEach(element => {
      if (element.category == 'debit' || element.category == 'send') {
        feePromises.push(
          rpc('gettransaction', [element.txid]).then(payload => {
            feeData.set(payload.time, payload.fee);
            numberOfSends++;
            this.setState(
              {
                CSVProgress: numberOfSends / feePromises.length,
              },
              () => {
                this.updateProgress();
              }
            );
          })
        );
      }
    });
    await Promise.all(feePromises);
    this.setFeeValuesOnTransaction(feeData);
    this.finishCSVProcessing();
  }

  /**
   * Set events for the CSV Listener
   *
   * @param {*} events
   * @memberof Transactions
   */
  setCSVEvents(events) {
    this._Onprogress = events.progress;
    this._OnCSVFinished = events.finished;
  }

  /**
   * Each time a transaction is done processing, run this.
   *
   * @memberof Transactions
   */
  updateProgress() {
    this._Onprogress(this.state.CSVProgress * 100);
  }

  /**
   * When proccessing is finished, open up the save dialog
   *
   * @memberof Transactions
   */
  finishCSVProcessing() {
    googleanalytics.SendEvent('Transaction', 'Data', 'Download CSV', 1);
    this.saveCSV(this.returnAllFilters([...this.props.walletitems]));
    this._OnCSVFinished();
    this.setState({
      CSVProgress: 0,
    });
  }

  /**
   * creates a CSV file then prompts the user to save that file
   *
   * @param {[*]} DataToSave Transactions to save
   * @memberof Transactions
   */
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

  // Mandatory React method
  /**
   * React Render
   *
   * @returns JSX for Element
   * @memberof Transactions
   */
  render() {
    const {
      filteredTransactions,
      account,
      coreConnected,
      openModal,
      setTxsAccountFilter,
      accountOptions,
      minConfirmations,
    } = this.props;

    return (
      <Panel
        icon={transactionIcon}
        title={__('Transaction details')}
        controls={
          <div className="flex center">
            <Tooltip.Trigger tooltip={__('Show transactions chart')}>
              <Button
                skin="plain"
                onClick={() => openModal(TransactionsChartModal)}
              >
                <Icon icon={barChartIcon} width={20} height={20} />
              </Button>
            </Tooltip.Trigger>

            <Tooltip.Trigger tooltip={__('Download as CSV')}>
              <Button skin="plain" onClick={() => this.DownloadCSV()}>
                <Icon icon={downloadIcon} />
              </Button>
            </Tooltip.Trigger>

            <AccountSelect
              value={account}
              onChange={setTxsAccountFilter}
              options={accountOptions}
            />
          </div>
        }
      >
        {!coreConnected ? (
          <WaitingMessage>
            {__('Connecting to Nexus Core')}
            ...
          </WaitingMessage>
        ) : !filteredTransactions ? (
          <WaitingMessage>
            {__('Loading transactions')}
            ...
          </WaitingMessage>
        ) : (
          <TransactionsLayout>
            <Filters />
            <TransactionsTable
              data={filteredTransactions}
              columns={tableColumns}
              defaultPageSize={10}
              defaultSortingColumnIndex={0}
              getTrProps={(state, { original: tx }) => ({
                onClick: () => {
                  openModal(TransactionDetailsModal, {
                    txid: tx.txid,
                  });
                },
                style: {
                  cursor: 'pointer',
                  opacity:
                    tx.category === 'immature' ||
                    tx.category === 'orphan' ||
                    isPending(tx, minConfirmations)
                      ? 0.5
                      : 1,
                },
              })}
            />
          </TransactionsLayout>
        )}
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  actionCreators
)(Transactions);
