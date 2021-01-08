// External
import { Component } from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
6;
import Button from 'components/Button';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';
import RecipientField from './RecipientField';
import AmountField from './AmountField';

__ = __context('Send');

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
class Recipients extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Recipients
   */
  render() {
    const { fields, change, accBalance, sendFrom, addRecipient } = this.props;
    console.log('sendFrom', sendFrom);
    const token = {
      name: sendFrom.token_name
        ? sendFrom.token_name === '0'
          ? 'NXS'
          : sendFrom.token_name
        : sendFrom.name,
      address: sendFrom.token || sendFrom.address,
    };

    if (!fields || !fields.length) return null;

    if (fields.length === 1) {
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
            token={token}
          />
        </>
      );
    } else {
      return (
        <>
          {fields.map((fieldName, i) => (
            <Recipient key={i}>
              <Tooltip.Trigger tooltip={__('Remove recipient')}>
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
                  sendFrom={sendFrom}
                />
              </AddressWrapper>

              <AmountWrapper>
                <AmountField
                  parentFieldName={fieldName}
                  change={change}
                  token={token}
                />
              </AmountWrapper>
            </Recipient>
          ))}

          <MoreInfo>
            <Button skin="hyperlink" onClick={addRecipient}>
              <PlusIcon icon={plusIcon} className="space-right" />
              <span className="v-align">{__('Add recipient')}</span>
            </Button>
          </MoreInfo>
        </>
      );
    }
  }
}
export default Recipients;
