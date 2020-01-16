// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import GA from 'lib/googleAnalytics';

// Internal Global Dependencies
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import Table from 'components/Table';
import { openModal } from 'lib/ui';

//Invoice
import InvoiceForm from './InvoiceForm';

import nexusIcon from 'icons/NXS_coin.svg';
import styled from '@emotion/styled';
import { formatDateTime } from 'lib/intl';
import InvoiceDetailModal from './invoiceDetailsModal';

__ = __context('Invoice');

const contractStatus = ['Pending', 'Paid', 'Rejected'];

const timeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

const tableColumns = [
  {
    id: 'timestamp',
    Header: __('Time'),
    accessor: 'timestamp',
    Cell: cell =>
      cell.value ? formatDateTime(cell.value * 1000, timeFormatOptions) : '',
    width: 180,
  },
  {
    id: 'reference',
    Header: __('Reference'),
    accessor: 'reference',
    width: 240,
  },
  {
    id: 'accountPayable',
    Header: __('Account Payable'),
    accessor: 'accountPayable',
    width: 240,
  },
  {
    id: 'receipiant',
    Header: __('Receipiant'),
    accessor: 'receipiant',
    width: 240,
  },
  {
    id: 'status',
    Header: __('Status'),
    accessor: 'status',
    width: 100,
  },
];

const InvoiceTable = styled(Table)({});

const invoices = [
  {
    timestamp: '199232403',
    reference: 'Test1',
    accountPayable: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    receipiant: '2kaDJ92n1fj4n85Nj5n38fj28',
    status: 'Pending',
  },
];

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.core,
  };
};

/**
 * Invoice Page
 *
 * @class Invoice
 * @extends {Component}
 */
class Invoice extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    GA.SendScreen('Invoice');
  }

  render() {
    return (
      <Panel icon={nexusIcon} title={__('Invoice')}>
        <InvoiceTable
          data={invoices}
          columns={tableColumns}
          defaultPageSize={10}
          getTrProps={(state, row) => {
            const invoice = row && row.original;
            return {
              onClick: invoice
                ? () => {
                    openModal(InvoiceDetailModal, {
                      invoice,
                      txid: invoice.txid,
                    });
                  }
                : undefined,
              style: {
                cursor: 'pointer',
                fontSize: 15,
              },
            };
          }}
        />
        <InvoiceForm />
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(mapStateToProps)(Invoice);

/*

-invoiceNumber = int
-from = string
-to = string
-total = float
-items = []

*/
