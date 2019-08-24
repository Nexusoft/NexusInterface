// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import TextField from 'components/TextField';
import FormField from 'components/FormField';

const SendAmount = styled.div({
  display: 'flex',
});

const SendAmountField = styled.div({
  flex: 1,
});

/**
 * The Amount Feild on the Send Page for Tritium
 *
 * @class TritiumAmountField
 * @extends {Component}
 */

class TritiumAmountField extends Component {
  /**
   * React Render
   *
   * @returns
   * @memberof TritiumAmountField
   */
  render() {
    return (
      <SendAmount>
        <SendAmountField>
          <FormField
            connectLabel
            label={
              <span className="v-align">
                <Text id="sendReceive.Amount" />
              </span>
            }
          >
            <Field
              component={TextField.RF}
              name="tritiumRecipiant.amount"
              placeholder="0.00000"
            />
          </FormField>
        </SendAmountField>
      </SendAmount>
    );
  }
}
export default TritiumAmountField;
