// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import GA from 'lib/googleAnalytics';
import styled from '@emotion/styled';
import { formatDateTime } from 'lib/intl';
import Button from 'components/Button';

// Internal Global Dependencies
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import Table from 'components/Table';
import { openModal } from 'lib/ui';
import nexusIcon from 'icons/NXS_coin.svg';

//Invoice
import InvoiceForm from './InvoiceForm';
import Filters from './Filters';
import InvoiceDetailModal from './invoiceDetailsModal';

import plusIcon from 'icons/plus.svg';
import memoize from 'utils/memoize';
import { isMyAddress } from './selectors';

__ = __context('Invoice');

const contractStatus = ['Pending', 'Paid', 'Rejected'];

const Header = styled.div({});

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
    id: 'status',
    Header: __('Status'),
    accessor: 'status',
    width: 100,
  },
  {
    id: 'reference',
    Header: __('Reference'),
    accessor: 'reference',
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
];

const InvoiceTable = styled(Table)({});

const invoices = [
  {
    timestamp: '199232403',
    description: 'This is a  test invoice',
    dueDate: '199255403',
    reference: 'Test1',
    invoiceNumber: 2,
    accountPayable: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    receipiant:
      'a1537d5c089ebe309887bcf6a9c2e219ca64257922ce91455c2ca86617536a2d',
    receipiantDetails: '1111 North Street \n LA California N USA',
    status: 'Pending',
    accountPayableDetails: '1234 Main Street \n Phx Arizona \n USA',
    items: [
      { description: 'Item1', unitPrice: '2.0421', unitQuantity: '4' },
      { description: 'Item2', unitPrice: '20', unitQuantity: '1' },
      { description: 'Item3', unitPrice: '1.62342', unitQuantity: '6' },
      { description: 'Item4', unitPrice: '0.1355', unitQuantity: '19' },
      { description: 'Item5', unitPrice: '12', unitQuantity: '3' },
      { description: 'Item6', unitPrice: '5.3', unitQuantity: '2' },
      { description: 'Item2', unitPrice: '20', unitQuantity: '1' },
      { description: 'Item3', unitPrice: '1.62342', unitQuantity: '6' },
      { description: 'Item4', unitPrice: '0.1355', unitQuantity: '19' },
      { description: 'Item5', unitPrice: '12', unitQuantity: '3' },
      { description: 'Item6', unitPrice: '5.3', unitQuantity: '2' },
    ],
  },
  {
    timestamp: '19925562103',
    reference: 'aTest2',
    accountPayable: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    receipiant: '2kaDJ92n1fj4n85Nj5n38fj28',
    status: 'Rejected',
    items: [{ description: 'Item1', unitPrice: '2.0421', unitQuantity: '4' }],
  },
  {
    timestamp: '1992324203',
    reference: 'uTest3',
    accountPayable: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    receipiant: '2kaDJ92n1fj4n85Nj5n38fj28',
    status: 'Paid',
    items: [{ description: 'Item1', unitPrice: '2.0421', unitQuantity: '4' }],
  },
  {
    timestamp: '19923240993',
    reference: 'pTest4',
    accountPayable: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    receipiant: '2kaDJ92n1fj4n85Nj5n38fj28',
    status: 'Pending',
    items: [{ description: 'Item1', unitPrice: '2.0421', unitQuantity: '4' }],
  },
];

const memorizedFilters = memoize(
  (invoiceList, referenceQuery, timespan, status) =>
    invoiceList &&
    invoiceList.filter(
      element =>
        (!referenceQuery || element.reference.includes(referenceQuery)) &&
        (!status ||
          status === 'ALL' ||
          element.status.toLowerCase() === status.toLowerCase())
    )
);

// React-Redux mandatory methods
const mapStateToProps = state => {
  const { userStatus } = state.core;
  const { genesis } = userStatus || { genesis: '' };

  return {
    ...state.core,
    ...state.ui,
    genesis: genesis,
    accounts: state.core.accounts || [],
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
    const { referenceQuery, status, timespan } = this.props.invoices;
    const { accounts, genesis } = this.props;
    const filteredInvoices = memorizedFilters(
      invoices,
      referenceQuery,
      timespan,
      status
    );
    console.log(status);
    console.log(filteredInvoices);
    return (
      <Panel icon={nexusIcon} title={__('Invoice')}>
        <Header>
          <Filters>
            <Button onClick={() => openModal(InvoiceForm)}>
              <Icon
                icon={plusIcon}
                style={{
                  fontSize: '.8em',
                  opacity: 0.7,
                  overflow: 'visible',
                  marginRight: '0.25em',
                }}
              />
              {'   New Invoice'}
            </Button>
          </Filters>
        </Header>
        <InvoiceTable
          data={filteredInvoices}
          columns={tableColumns}
          defaultPageSize={10}
          defaultSortingColumnIndex={0}
          getTrProps={(state, row) => {
            const invoice = row && row.original;
            return {
              onClick: invoice
                ? () => {
                    openModal(InvoiceDetailModal, {
                      invoice,
                      txid: invoice.txid,
                      isMine: isMyAddress(
                        accounts,
                        genesis,
                        invoice.receipiant
                      ),
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
