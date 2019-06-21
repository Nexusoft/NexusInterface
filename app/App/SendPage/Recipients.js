// External
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Text from 'components/Text';
import { timing } from 'styles';
import plusIcon from 'images/plus.sprite.svg';
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

const TransactionFee = styled.div(({ theme }) => ({
  color: theme.mixer(0.75),
}));

const mapStateToProps = ({
  core: {
    info: { paytxfee },
  },
}) => ({
  paytxfee,
});

/**
 * Recipients Field from the Send Page
 *
 * @class Recipients
 * @extends {React.Component}
 */
@connect(mapStateToProps)
class Recipients extends React.Component {
  /**
   * Return Tx Fee
   *
   * @memberof Recipients
   */
  renderTxFee = () =>
    !!this.props.paytxfee && (
      <TransactionFee>
        <Text id="sendReceive.FEE" />: {this.props.paytxfee.toFixed(5)} NXS
      </TransactionFee>
    );

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Recipients
   */
  render() {
    const { fields, change, addRecipient, paytxfee } = this.props;

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

          <MoreInfo>{this.renderTxFee()}</MoreInfo>
        </>
      );
    } else {
      return (
        <>
          {fields.map((fieldName, i) => (
            <Recipient key={i}>
              <Tooltip.Trigger
                tooltip={<Text id="sendReceive.RemoveRecipient" />}
              >
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
          ))}

          <MoreInfo>
            <Button skin="hyperlink" onClick={addRecipient}>
              <PlusIcon icon={plusIcon} className="space-right" />
              <span className="v-align">
                <Text id="sendReceive.AddRecipient" />
              </span>
            </Button>

            {this.renderTxFee()}
          </MoreInfo>
        </>
      );
    }
  }
}
export default Recipients;
