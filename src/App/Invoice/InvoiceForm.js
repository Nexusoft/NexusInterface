// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import { apiPost } from 'lib/tritiumApi';
import { loadAccounts } from 'lib/user';
import { formName, defaultValues } from 'lib/send';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import AutoSuggest from 'components/AutoSuggest';
import Select from 'components/Select';
import FormField from 'components/FormField';
import Tooltip from 'components/Tooltip';
import Arrow from 'components/Arrow';
import { openSuccessDialog } from 'lib/ui';
import { errorHandler } from 'utils/form';
import sendIcon from 'icons/send.svg';
import { numericOnly } from 'utils/form';
import confirmPin from 'utils/promisified/confirmPin';
import questionIcon from 'icons/question-mark-circle.svg';
import FieldSet from 'components/FieldSet';
import * as color from 'utils/color';

import InvoiceItems from './InvoiceItems';
import { formatNumber } from 'lib/intl';

import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
  getAccountInfo,
  getRecipientSuggestions,
} from './selectors';

// React-Redux mandatory methods
const mapStateToProps = state => {
  const valueSelector = formValueSelector('InvoiceForm');
  return {
    ...state.core,
    suggestions: getRecipientSuggestions(
      state.addressBook,
      state.core.accounts
    ),
    accountOptions: getAccountOptions(state.core.accounts),
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
  flex: '0 0 50%',
  marginRight: '.25em',
});

const FromSection = styled(SectionBase)({
  marginLeft: '.25em',
  flex: '1',
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
          placeholder: __('Recipient Address/Name'),
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
    sendFrom: '',
    sendDetail: '',
    recipientAddress: '',
    recipientDetail: '',
    items: [{ description: '', units: 1, unitPrice: 0 }],
  },
  validate: ({ sendFrom }) => {
    const errors = {};
    return errors;
  },
  asyncValidate: async values => {
    console.log(values);
    const {
      invoicDescription,
      invoiceNumber,
      invoiceReference,
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
  onSubmit: async ({
    invoicDescription,
    invoiceNumber,
    invoiceReference,
    sendFrom,
    sendDetail,
    recipientAddress,
    recipientDetail,
    items,
  }) => {
    console.error('AAAA');

    const jsonItems = JSON.stringify(items);

    const pin = await confirmPin();
    if (pin) {
      const params = {
        pin,
      };
      console.log(params);
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    if (!result) return;
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

    return (
      <FormComponent onSubmit={handleSubmit}>
        <InvoiceDataSection legend={__('Details')}>
          <FormField label={__('Description')}>
            <Field
              component={TextField.RF}
              props={{ ...this.props, multiline: true, rows: 1 }}
              name="invoiceDescription"
              placeholder="Description"
            />
          </FormField>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto',
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
          </div>
        </InvoiceDataSection>
        <div style={{ display: 'flex' }}>
          <ToSection legend={__('To')}>
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
                props={{ ...this.props, multiline: true, rows: 1 }}
                placeholder="Name/Address/phoneNumber etc"
              />
            </FormField>
          </ToSection>
          <FromSection legend={__('From')}>
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
                props={{ ...this.props, multiline: true, rows: 1 }}
                placeholder="Name/Address/phoneNumber etc"
              />
            </FormField>
          </FromSection>
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
          {__('Total: %{total} NXS', {
            total: formatNumber(this.gatherTotal(), 6),
          })}
        </Footer>
      </FormComponent>
    );
  }
}

export default InvoiceForm;
