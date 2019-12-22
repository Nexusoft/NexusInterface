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

import InvoiceItems from './InvoiceItems';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.core,
  };
};

const FormComponent = styled.form({});

const SectionBase = styled.div(({ theme }) => ({
  padding: '1em',
  margin: '0.25em 0 0.25em 0',
  border: `1px solid ${theme.primary}`,
  borderRadius: '5px',
  background: theme.mixer(0.1),
}));

const ToSection = styled(SectionBase)({});

const FromSection = styled(SectionBase)({});

const ItemListSection = styled(SectionBase)({});

const InvoiceDataSection = styled(SectionBase)({});

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
    Items: [{ description: '', units: 1, unitPrice: 1 }],
  },
  validate: ({ sendFrom }) => {
    const errors = {};
    return errors;
  },
  asyncValidate: async ({ recipients }) => {
    return null;
  },
  onSubmit: async ({ sendFrom }, dispatch, props) => {
    const pin = await confirmPin();
    if (pin) {
      const params = {
        pin,
      };
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

  /**
   * Add Recipient to the queue
   *
   * @memberof SendForm
   */
  addRecipient = () => {
    console.log('Add Item');
    this.props.array.push('Items', {
      description: '',
      units: 1,
      unitPrice: 1,
    });
  };

  /**
   * Return JSX for the Add Recipient Button
   *
   * @memberof SendForm
   */
  renderAddItemButton = ({ fields }) => (
    <Button onClick={this.addRecipient}>{__('Add Item')}</Button>
  );

  render() {
    return (
      <FormComponent onSubmit={this.confirmSend}>
        {'Form'}
        <InvoiceDataSection>
          <div>{'Data'}</div>
          <FormField label={__('Invoice Number')}>
            <Field
              component={TextField.RF}
              name="invoiceNumber"
              placeholder="Number"
            />
          </FormField>
        </InvoiceDataSection>
        <ToSection>
          <div>{'ToSection'}</div>
          <FormField label={__('Account Payable')}>
            <Field
              component={TextField.RF}
              name="sendFrom"
              placeholder="Send From"
            />
          </FormField>
          <FormField label={__('Sender Details')}>
            <Field
              component={TextField.RF}
              name="sendDetail"
              placeholder="Name/Address/phoneNumber etc"
            />
          </FormField>
        </ToSection>
        <FromSection>
          <div>{'From Section'}</div>
          <FormField label={__('Recipiant')}>
            <Field
              component={TextField.RF}
              name="recipiantAddress"
              placeholder="Recipient Address"
            />
          </FormField>
          <FormField label={__('Recipiant Details')}>
            <Field
              component={TextField.RF}
              name="recipiantDetail"
              placeholder="Name/Address/phoneNumber etc"
            />
          </FormField>
        </FromSection>
        <ItemListSection>
          <FieldArray
            component={InvoiceItems}
            name="Items"
            addRecipient={this.addRecipient}
          ></FieldArray>
          <FieldArray
            component={this.renderAddItemButton}
            name="addItemsButton"
          ></FieldArray>
        </ItemListSection>
      </FormComponent>
    );
  }
}

export default InvoiceForm;
