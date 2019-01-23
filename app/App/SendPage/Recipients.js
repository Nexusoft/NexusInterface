// External
import React from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import { timing } from 'styles';
import RecipientField from './RecipientField';
import AmountField from './AmountField';

const RemoveButton = styled.div(({ theme }) => ({
  position: 'absolute',
  left: 3,
  bottom: 8,
  cursor: 'pointer',
  width: '1.2em',
  height: '1.2em',
  fontSize: '.8em',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  color: theme.mixer(0.75),
  // border: '1px solid',
  opacity: 0,
  transition: `color ${timing.normal}, opacity ${timing.normal}`,
  '&:hover': {
    color: theme.mixer(0.875),
  },
}));

const Recipient = styled.div({
  display: 'flex',
  alignItems: 'center',
  margin: '0 -30px',
  padding: '0 30px',
  position: 'relative',

  '&:hover': {
    [RemoveButton]: {
      opacity: 1,
    },
  },
});

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
        <Recipient key={i}>
          <Tooltip.Trigger tooltip="Remove recipient">
            <RemoveButton
              onClick={() => {
                fields.remove(i);
              }}
            >
              ✕
            </RemoveButton>
          </Tooltip.Trigger>
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
        </Recipient>
      ));
    }
  }
}
