// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  reduxForm,
  Field,
  FieldArray,
  formValueSelector,
  getFormValues,
  reset,
} from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import { apiPost } from 'lib/tritiumApi';
import { loadAccounts, loadInvoices } from 'lib/user';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import AutoSuggest from 'components/AutoSuggest';
import Select from 'components/Select';
import FormField from 'components/FormField';
import Tooltip from 'components/Tooltip';
import Arrow from 'components/Arrow';
import { openSuccessDialog, openModal, removeModal, resetForm } from 'lib/ui';
import { errorHandler } from 'utils/form';
import sendIcon from 'icons/send.svg';
import { numericOnly } from 'utils/form';
import confirmPin from 'utils/promisified/confirmPin';
import questionIcon from 'icons/question-mark-circle.svg';
import FieldSet from 'components/FieldSet';
import * as color from 'utils/color';
import Modal from 'components/Modal';

import InvoiceItems from './InvoiceItems';
import { formatNumber } from 'lib/intl';

import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
  getAccountInfo,
  getRecipientSuggestions,
} from './selectors';
import DateTime from 'components/DateTimePicker';
import SuccessDialog from 'components/Dialogs/SuccessDialog';
import { addNewDraft } from 'lib/invoiceDraft';

__ = __context('Invoice Form');

// React-Redux mandatory methods
const mapStateToProps = state => {
  const valueSelector = formValueSelector('InvoiceForm');
  return {
    ...state.core,
    suggestions: getRecipientSuggestions(
      state.addressBook,
      state.core.accounts
    ),
    username: state.core.userStatus.username,
    accountOptions: getAccountOptions(state.core.accounts),
    copy: getFormValues('InvoiceForm')(state),
    items: valueSelector(state, 'items') || [],
  };
};

const FormComponent = styled.form({});

const SectionBase = styled(FieldSet)(({ theme }) => ({
  padding: '0em 1em 1em 1em',
  margin: '0.25em 0 0.25em 0',
  border: `1px solid ${theme.primary}`,
  borderRadius: '5px',
  background: theme.mixer(0.1),

  '& > legend': {
    backgroundColor: color.darken(theme.background, 0.3),
    border: `1px solid ${theme.primary}`,
    borderRadius: '5px',
  },
}));

const ToSection = styled(SectionBase)({
  marginLeft: '.25em',
  flex: '1',
});

const FromSection = styled(SectionBase)({
  flex: '0 0 50%',
  marginRight: '.25em',
});

const ItemListSection = styled(SectionBase)({});

const InvoiceDataSection = styled(SectionBase)({});

const Footer = styled.div({
  marginTop: '1em',
});

class RecipientField extends Component {
  handleSelect = element => {
    this.props.change(this.props.input.name, element);
  };

  render() {
    const { input, meta, suggestions } = this.props;
    return (
      <AutoSuggest.RF
        input={input}
        meta={meta}
        onSelect={this.handleSelect}
        inputProps={{
          placeholder: __('Recipient Genesis/UserName'),
        }}
        suggestions={suggestions}
      />
    );
  }
}

/**
 * The Internal Send Form in the Send Page
 *
 * @class SendForm
 * @extends {Component}
 */
@connect(mapStateToProps)
@reduxForm({
  form: 'InvoiceForm',
  destroyOnUnmount: false,
  initialValues: {
    invoiceDescription: '',
    invoiceNumber: 0,
    invoiceReference: '',
    invoiceDueDate: '',
    sendFrom: '',
    sendDetail: '',
    recipientAddress: '',
    recipientDetail: '',
    items: [{ description: '', units: 1, unitPrice: 0 }],
  },
  validate: values => {
    const errors = {};
    const {
      invoiceDescription,
      invoiceNumber,
      invoiceReference,
      invoiceDueDate,
      sendFrom,
      sendDetail,
      recipientAddress,
      recipientDetail,
      items,
    } = values;
    if (!invoiceDescription)
      errors.invoiceDescription = __('Description Needed');
    if (!invoiceNumber || isNaN(invoiceNumber))
      errors.invoiceNumber = __('Invalid Number');
    if (!invoiceReference) errors.invoiceReference = __('Reference Needed');
    if (!sendFrom) errors.sendFrom = __('Account Payable Needed');
    if (!recipientAddress) errors.recipientAddress = __('Address Needed');
    if (items && items.length == 0) errors.items = __('Items Needed');
    console.log(errors);
    return errors;
  },
  asyncValidate: async values => {
    console.log(values);
    return null;
    const {
      invoiceDescription,
      invoiceNumber,
      invoiceReference,
      invoiceDueDate,
      sendFrom,
      sendDetail,
      recipientAddress,
      recipientDetail,
      items,
    } = values;

    const recipientInputSize = new Blob(recipientAddress).size;

    const isAddress =
      recipientInputSize === 51 &&
      recipientAddress.match(/([0OIl+/])/g) === null;

    if (isAddress) {
      const isAddressResult = await apiPost('system/validate/address', {
        address: recipientAddress,
      });
      if (!isAddressResult.is_valid) {
        throw { recipientAddress: [{ address: __('Invalid address') }] };
      }
    }

    return null;
  },
  onSubmit: async (
    {
      invoiceDescription,
      invoiceNumber,
      invoiceDueDate,
      invoiceReference,
      sendFrom,
      sendDetail,
      recipientAddress,
      recipientDetail,
      items,
    },
    dispatch,
    props
  ) => {
    const creationDate = Date.now();
    const dueDate = new Date(invoiceDueDate).getTime() / 1000;
    const convertedItems = items.map(e => {
      return {
        description: e.description,
        units: e.units,
        unit_price: e.unitPrice,
      };
    });

    const pin = await confirmPin();
    const isSendAddress = await apiPost('system/validate/address', {
      address: sendFrom,
    });
    if (pin) {
      const params = {
        pin,
        extra_field: 'Extra',
        reference: invoiceReference,
        description: invoiceDescription,
        contact: 'foo@bar.com',
        items: convertedItems,
      };
      isSendAddress.is_valid
        ? (params.account = sendFrom)
        : (params.account_name = `${props.username}:${sendFrom}`);
      if (recipientAddress.startsWith('a') && recipientAddress.length === 64) {
        params.recipient = recipientAddress;
      } else {
        params.recipient_username = recipientAddress;
      }
      if (invoiceNumber) params.number = invoiceNumber;
      if (invoiceDueDate) params.due_date = dueDate;
      if (sendDetail) params.sender_detail = sendDetail;
      if (recipientDetail) params.recipient_detail = recipientDetail;
      console.log(params);
      const asd = await apiPost('invoices/create/invoice', params);
      console.log(asd);
      return asd;
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    console.error(result);
    if (!result) return;

    removeModal(props.modalId);
    openModal(SuccessDialog);
    loadInvoices();
    dispatch(reset('InvoiceForm'));
  },
  onSubmitFail: errorHandler(__('Error sending NXS')),
})
class InvoiceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    loadAccounts();
  }

  /**
   * Add Recipient to the queue
   *
   * @memberof SendForm
   */
  addInvoiceItem = () => {
    console.log('Add Item');
    this.props.array.push('items', {
      description: '',
      units: 1,
      unitPrice: 0,
    });
  };

  /**
   * Return JSX for the Add Recipient Button
   *
   * @memberof SendForm
   */
  renderAddItemButton = ({ fields }) => (
    <Button onClick={this.addInvoiceItem}>{__('Add Item')}</Button>
  );

  gatherTotal() {
    return this.props.items.reduce((total, element) => {
      return total + element.units * element.unitPrice;
    }, 0);
  }

  saveAsDraft() {
    console.error(this.props);
    addNewDraft(this.props.copy);
    resetForm('InvoiceForm');
    //this.props.reset();
  }

  render() {
    const {
      accountOptions,
      change,
      handleSubmit,
      submitting,
      input,
      meta,
      suggestions,
    } = this.props;

    const { onSubmitSuccess, onSubmitFail, ...other } = this.props;

    return (
      <Modal
        style={{
          width: '90%',
          maxHeight: '90%',
          height: '90%',
        }}
      >
        <Modal.Header>{'New Invoice'}</Modal.Header>
        <Modal.Body>
          <FormComponent onSubmit={handleSubmit}>
            <InvoiceDataSection legend={__('Details')}>
              <FormField label={__('Description')}>
                <Field
                  component={TextField.RF}
                  props={{ ...other, multiline: true, rows: 1 }}
                  name="invoiceDescription"
                  placeholder="Description"
                />
              </FormField>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto auto auto',
                  gridTemplateRows: 'auto',
                  gridGap: '1em 1em',
                }}
              >
                <FormField label={__('Reference')}>
                  <Field
                    component={TextField.RF}
                    name="invoiceReference"
                    placeholder="Reference"
                  />
                </FormField>
                <FormField label={__('Number')}>
                  <Field
                    component={TextField.RF}
                    name="invoiceNumber"
                    placeholder="Number"
                  />
                </FormField>
                <FormField label={__('Due Date')}>
                  <Field component={DateTime.RF} name="invoiceDueDate" />
                </FormField>
              </div>
            </InvoiceDataSection>
            <div style={{ display: 'flex' }}>
              <FromSection legend={__('From')}>
                <FormField label={__('Account Payable')}>
                  <Field
                    component={Select.RF}
                    name="sendFrom"
                    placeholder={__('Select an account')}
                    options={accountOptions}
                  />
                </FormField>
                <FormField label={__('Sender Details')}>
                  <Field
                    component={TextField.RF}
                    name="sendDetail"
                    props={{ ...other, multiline: true, rows: 1 }}
                    placeholder="Name/Address/phoneNumber etc"
                  />
                </FormField>
              </FromSection>
              <ToSection legend={__('To')}>
                <FormField label={__('Recipient')}>
                  <Field
                    component={RecipientField}
                    name="recipientAddress"
                    change={change}
                    suggestions={suggestions}
                    placeholder="Recipient Address"
                  />
                </FormField>
                <FormField label={__('Recipient Details')}>
                  <Field
                    component={TextField.RF}
                    name="recipientDetail"
                    props={{ ...other, multiline: true, rows: 1 }}
                    placeholder="Name/Address/phoneNumber etc"
                  />
                </FormField>
              </ToSection>
            </div>
            <ItemListSection legend={__('Items')}>
              <FieldArray
                component={InvoiceItems}
                name="items"
                change={change}
                addInvoiceItem={this.addInvoiceItem}
              ></FieldArray>
            </ItemListSection>

            <Footer className="mt3 flex space-between">
              <Button type="submit" skin="primary" disabled={submitting}>
                {__('Submit')}
              </Button>
              <Button
                skin="primary"
                onClick={() => this.saveAsDraft()}
                disabled={submitting}
              >
                {__('Save As Draft')}
              </Button>
              {__('Total: %{total} NXS', {
                total: formatNumber(this.gatherTotal(), 6),
              })}
            </Footer>
          </FormComponent>
        </Modal.Body>
      </Modal>
    );
  }
}

export default InvoiceForm;
