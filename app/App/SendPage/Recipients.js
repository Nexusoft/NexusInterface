// External
import React from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import RecipientField from './RecipientField';
import AmountField from './AmountField';

const AddressWrapper = styled.div({
  flexGrow: 5,
  flexBasis: 0,
  marginRight: '1em',
});

const AmountWrapper = styled.div({
  flexGrow: 2,
  flexBasis: 0,
});

export default class Recipients extends React.Component {
  updateAddress = address => {
    this.props.change();
  };

  render() {
    const { fields, change } = this.props;

    if (!fields || !fields.length) return null;

    if (fields.length === 1) {
      return (
        <>
          <Field
            name={`${fields.name}[0].address`}
            component={RecipientField}
            change={change}
          />
          <AmountField parentFieldName={`${fields.name}[0]`} change={change} />
        </>
      );
    } else {
      return fields.map((fieldName, i) => (
        <div className="flex center" key={i}>
          <AddressWrapper>
            <Field
              name={`${fieldName}.address`}
              component={RecipientField}
              change={change}
            />
          </AddressWrapper>
          <AmountWrapper>
            <AmountField parentFieldName={fieldName} change={change} />
          </AmountWrapper>
        </div>
      ));
    }
  }
}
