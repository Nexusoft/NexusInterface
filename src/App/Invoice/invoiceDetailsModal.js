// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

//Internal Dependencies
import Modal from 'components/Modal';
import styled from '@emotion/styled';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import * as color from 'utils/color';
import { formatDateTime } from 'lib/intl';
import { openConfirmDialog } from 'lib/ui';
import { apiPost } from 'lib/tritiumApi';

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const ModalInternal = styled(Modal)({ maxHeight: '90%' });

const HeaderSubtext = styled.div({
  fontSize: '75%',
});

const Row = styled.div({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: '1fr 2fr',
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
});

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const Field = ({ label, children }) => (
  <Row>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

const CenterValue = styled.div(({ theme }) => ({
  color: theme.mixer(0.875),
  textAlign: 'center',
}));

const ItemsContainter = styled.div(({ theme }) => ({
  height: '12em',
  padding: '1em 0em 0em 0.25em',
  backgroundColor: color.darken(theme.background, 0.5),
}));
const InvoiceItem = ({ description, unit_price, units, itemTotal }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 8em 5em 10em',
      gridTemplateRows: 'auto',
      gridGap: '1em 1em',
    }}
  >
    <div>{description}</div>
    <div>{unit_price}</div>
    <div>{units}</div>
    <div>{itemTotal}</div>
  </div>
);

const InvoiceItems = ({ items }) => {
  return (
    <ItemsContainter>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 8em 5em 10em',
          gridTemplateRows: 'auto',
          gridGap: '1em 1em',
        }}
      >
        {' '}
        <div>{'Description'}</div>
        <div>{'Price'}</div>
        <div>{'Quantity'}</div>
        <div>{'Total'}</div>
      </div>
      <div style={{ overflow: 'scroll', height: '9.4em' }}>
        {items.map(e => (
          <InvoiceItem
            description={e.description}
            unit_price={e.unit_price}
            units={e.units}
            itemTotal={e.unit_price * e.units}
          />
        ))}
      </div>
    </ItemsContainter>
  );
};

const StatusTag = styled.div(
  {
    width: '10em',
    height: '10em',
    position: 'absolute',
    top: '-80px',
    borderRight: '70px solid transparent',
    transform: 'skew(0deg, -45deg)',
    '& > h2': {
      position: 'absolute',
      top: '85px',
      left: '18px',
      color: 'dimgray',
      mixBlendMode: 'darken',
      transform: 'skew(0deg, 45deg) rotate(-45deg)',
    },
  },

  ({ theme, status }) => {
    switch (status) {
      case 'Pending':
        return { borderBottom: `70px solid ${theme.background}` };
      case 'Rejected':
        return { borderBottom: `70px solid ${theme.danger}` };
      case 'Paid':
        return { borderBottom: `70px solid ${theme.primary}` };
      default:
        return { borderBottom: `70px solid ${theme.background}` };
    }
  }
);

const PastDueText = styled.a(({ theme }) => ({
  color: theme.danger,
}));

//Allow support any addtional key/values that may be attached to the invoice
const AdditionalKeyValues = addValues =>
  addValues.map(e => <Field label={e.key}>{e.value}</Field>);

class InvoiceDetailModal extends Component {
  componentDidMount() {}

  calculateTotal = items =>
    items.reduce((total, element) => {
      return total + element.units * element.unit_price;
    }, 0);

  clickPayNow = e => {
    openConfirmDialog({
      question: __('Do you want to fulfill this invoice?'),
      note: __('Withdraw from %{accountName} account', {
        accountName: 'default',
      }),
      callbackYes: () => {
        apiPost();
      },
    });
  };

  clickReject = e => {
    openConfirmDialog({
      question: __('Are you sure you want to reject this invoice?'),
      note: __(''),
      callbackYes: () => {
        apiPost();
        this.setInvoiceStatus('Rejected');
      },
    });
  };

  isPastDue() {
    const { dueDate } = this.props.invoice;
    if (Date.now() > dueDate) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    console.log(this.props);
    const {
      description,
      created,
      reference,
      invoiceNumber,
      dueDate,
      address,
      accountPayableDetails,
      recipient,
      recipientDetails,
      status,
      paidOn,
      items,
      ...rest
    } = this.props.invoice;
    const { isMine } = this.props;
    const pastDue = this.isPastDue();
    console.log(isMine);
    console.log(this.isPastDue());
    this.calculateTotal(items);
    console.log(items);
    return (
      <ModalInternal assignClose={closeModal => (this.closeModal = closeModal)}>
        <StatusTag status={status}>
          <h2>{status}</h2>
        </StatusTag>
        <Modal.Header>
          {'Invoice'}
          <HeaderSubtext>{description}</HeaderSubtext>
        </Modal.Header>
        <Modal.Body style={{ overflow: 'hidden' }}>
          <Field label={__('Created')}>
            {' '}
            {formatDateTime(created * 1000, timeFormatOptions)}{' '}
          </Field>
          {reference && <Field label={__('Reference')}>{reference}</Field>}
          {invoiceNumber && (
            <Field label={__('Invoice Number')}>{invoiceNumber}</Field>
          )}
          {dueDate && (
            <Field label={__('Due Date')}>
              {pastDue ? (
                <Tooltip.Trigger
                  tooltip={__('Warning, Past Due!')}
                  position={'top'}
                >
                  <PastDueText>
                    {formatDateTime(dueDate, timeFormatOptions)}
                  </PastDueText>
                </Tooltip.Trigger>
              ) : (
                formatDateTime(dueDate, timeFormatOptions)
              )}
            </Field>
          )}
          <Field label={__('Account Payable')}>{address}</Field>
          {accountPayableDetails && (
            <Field label={__('Details')}>{accountPayableDetails}</Field>
          )}
          <Field label={__('Receipiant')}>{recipient}</Field>
          {recipientDetails && (
            <Field label={__('Details')}>{recipientDetails}</Field>
          )}
          <Field label={__('Status')}>{status}</Field>
          {paidOn && (
            <Field label={__('Paid On')}>
              {formatDateTime(paidOn, timeFormatOptions)}
            </Field>
          )}
          <Field label={__('Total')}>{`${this.calculateTotal(
            items
          )} NXS`}</Field>

          <CenterValue>{__('Items')}</CenterValue>
          {items && <InvoiceItems items={items} />}
        </Modal.Body>
        <Modal.Footer>
          {isMine ? (
            <div
              className="mt2 flex space-between"
              style={{ marginBottom: '1em' }}
            >
              <Button skin="primary" onClick={() => this.closeModal()}>
                {'Close'}
              </Button>
              <Button skin="primary" onClick={this.clickPayNow}>
                {'Pay'}
              </Button>
            </div>
          ) : (
            <div
              className="mt2 flex space-between"
              style={{ marginBottom: '1em' }}
            >
              <Button skin="primary" onClick={() => this.closeModal()}>
                {'Close'}
              </Button>
              {status !== 'Paid' && (
                <Tooltip.Trigger
                  tooltip={__(
                    'Reject this invoice, preventing the recipient from paying it.'
                  )}
                  position={'top'}
                >
                  <Button skin="danger" onClick={this.clickReject}>
                    {'Reject'}
                  </Button>
                </Tooltip.Trigger>
              )}
            </div>
          )}
        </Modal.Footer>
      </ModalInternal>
    );
  }
}

export default InvoiceDetailModal;
