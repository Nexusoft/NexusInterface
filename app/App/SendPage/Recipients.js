import React from 'react';
import { Field } from 'redux-form';

import RecipientField from './RecipientField';
import AmountField from './AmountField';

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
    }
  }
}
