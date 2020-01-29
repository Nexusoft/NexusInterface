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
import Arrow from 'components/Arrow';

//Invoice
import InvoiceForm from './InvoiceForm';
import Filters from './Filters';
import InvoiceDetailModal from './invoiceDetailsModal';

import plusIcon from 'icons/plus.svg';
import memoize from 'utils/memoize';
import { isMyAddress } from './selectors';
import { apiGet } from 'lib/tritiumApi';
import { loadInvoices } from 'lib/user';

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
    id: 'created',
    Header: __('Time'),
    accessor: 'created',
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
    id: 'address',
    Header: __('Account Payable'),
    accessor: 'address',
    width: 240,
  },
  {
    id: 'recipient',
    Header: __('Receipiant'),
    accessor: 'recipient',
    width: 240,
  },
];

const InvoiceTable = styled(Table)({});

const invoices = [
  {
    created: '199232403',
    description: 'This is a  test invoice',
    dueDate: '199255403',
    reference: 'Test1',
    invoiceNumber: 2,
    address: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    recipient:
      'a1537d5c089ebe309887bcf6a9c2e219ca64257922ce91455c2ca86617536a2d',
    recipientDetails: '1111 North Street \n LA California N USA',
    status: 'Pending',
    accountPayableDetails: '1234 Main Street \n Phx Arizona \n USA',
    items: [
      { description: 'Item1', unit_price: '2.0421', units: '4' },
      { description: 'Item2', unit_price: '20', units: '1' },
      { description: 'Item3', unit_price: '1.62342', units: '6' },
      { description: 'Item4', unit_price: '0.1355', units: '19' },
      { description: 'Item5', unit_price: '12', units: '3' },
      { description: 'Item6', unit_price: '5.3', units: '2' },
      { description: 'Item2', unit_price: '20', units: '1' },
      { description: 'Item3', unit_price: '1.62342', units: '6' },
      { description: 'Item4', unit_price: '0.1355', units: '19' },
      { description: 'Item5', unit_price: '12', units: '3' },
      { description: 'Item6', unit_price: '5.3', units: '2' },
    ],
  },
  {
    created: '19925562103',
    reference: 'aTest2',
    address: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    recipient: '2kaDJ92n1fj4n85Nj5n38fj28',
    status: 'Rejected',
    items: [{ description: 'Item1', unit_price: '2.0421', units: '4' }],
  },
  {
    created: '1992324203',
    paidOn: '1992334203',
    reference: 'uTest3',
    address: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    recipient: '2kaDJ92n1fj4n85Nj5n38fj28',
    status: 'Paid',
    items: [{ description: 'Item1', unit_price: '2.0421', units: '4' }],
  },
  {
    created: '19923240993',
    reference: 'pTest4',
    address: '8MAF92nNAkk3288Skfn1n44kksn356n2k1',
    recipient: '2kaDJ92n1fj4n85Nj5n38fj28',
    status: 'Pending',
    items: [{ description: 'Item1', unit_price: '2.0421', units: '4' }],
  },
];

const memorizedFilters = memoize(
  (invoiceList, referenceQuery, timespan, status) =>
    invoiceList &&
    invoiceList.filter(element => {
      if (
        referenceQuery &&
        element.reference &&
        !element.reference.toLowerCase().includes(referenceQuery.toLowerCase())
      )
        return false;

      if (status && element.status && !element.status === status) return false;
      return true;
    })
);

const OptionsArrow = styled.span({
  display: 'inline-block',
  width: 15,
  verticalAlign: 'middle',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  const { userStatus } = state.core;
  const { genesis } = userStatus || { genesis: '' };

  return {
    invoiceCore: state.core.invoices,
    invoicesUI: state.ui.invoices,
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
  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
    };
  }

  // React Method (Life cycle hook)
  componentDidMount() {
    GA.SendScreen('Invoice');
    this.test();
    loadInvoices();
  }

  async test() {
    const aaa = await apiGet('users/list/invoices');
    console.log(aaa);
  }

  toggleMoreOptions = e => {
    this.setState({
      optionsOpen: !this.state.optionsOpen,
    });
  };

  render() {
    const { referenceQuery, status, timespan } = this.props.invoicesUI;
    const { accounts, genesis } = this.props;

    const tempInvoicec = [...invoices, ...this.props.invoiceCore];
    console.log(tempInvoicec);
    const filteredInvoices = memorizedFilters(
      tempInvoicec,
      referenceQuery,
      timespan,
      status
    );
    return (
      <Panel icon={nexusIcon} title={__('Invoice')}>
        <Header>
          <Filters optionsOpen={this.state.optionsOpen}>
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
            {
              <Button
                onClick={this.toggleMoreOptions}
                skin="hyperlink"
                style={{
                  width: '12px',
                  height: '10px',
                  gridRowStart: 3,
                  borderBottomStyle: 'none',
                  paddingBottom: '1em',
                }}
              >
                <OptionsArrow>
                  <Arrow
                    direction={this.state.optionsOpen ? 'down' : 'right'}
                    height={8}
                    width={10}
                  />
                </OptionsArrow>
                <span className="v-align">
                  {__(this.state.optionsOpen ? 'Less options' : 'More options')}
                </span>
              </Button>
            }
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
                      isMine: isMyAddress(accounts, genesis, invoice.recipient),
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
