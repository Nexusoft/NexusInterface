// External
import React from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import { timing } from 'styles';
import RecipientField from './RecipientField';
import AmountField from './AmountField';

const RemoveButton = styled.div(({ theme }) => ({
  position: 'absolute',
  left: 3,
  bottom: 8,
  cursor: 'pointer',
  width: '1.5em',
  height: '1.5em',
  fontSize: '1em',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.mixer(0.75),
  opacity: 1,
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

const MoreInfo = styled.div({
  marginTop: '1em',
  marginBottom: '1.5em',
  display: 'flex',
  justifyContent: 'space-between',
});

const PlusIcon = styled(Icon)({
  fontSize: '.8em',
});

/**
 * Recipients Field from the Send Page
 *
 * @class Recipients
 * @extends {React.Component}
 */
class Recipients extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Recipients
   */
  render() {
    const { fields, change, accBalance, sendFrom } = this.props;

    if (!fields || !fields.length) return null;

    return (
      <>
        <Field
          name={`${fields.name}[0].address`}
          component={RecipientField}
          change={change}
          sendFrom={sendFrom}
        />
        <AmountField
          fullAmount={accBalance}
          parentFieldName={`${fields.name}[0]`}
          change={change}
          token={{
            name: sendFrom.token_name
              ? sendFrom.token_name === '0'
                ? 'NXS'
                : sendFrom.token_name
              : sendFrom.name,
            address: sendFrom.token || sendFrom.address,
          }}
        />
      </>
    );
  }
}
export default Recipients;
