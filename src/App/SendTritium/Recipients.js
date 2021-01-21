// External
import { Component } from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import { timing } from 'styles';
import RecipientField from './RecipientField';
import AmountField from './AmountField';
import AdvancedFields from './AdvancedFields';

__ = __context('Send');

const RemoveButton = styled.div(({ theme }) => ({
  position: 'absolute',
  left: 3,
  top: '1em',
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
  // display: 'flex',
  // alignItems: 'center',
  marginLeft: -30,
  marginRight: -30,
  padding: '0 30px',
  position: 'relative',
});

const AddressWrapper = styled.div({
  flex: 8,
  flexBasis: 0,
  marginRight: '1em',
});

const AmountWrapper = styled.div({
  flex: 2,
  flexBasis: 0,
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
    const { fields, change, advancedOptions, source } = this.props;
    if (!fields?.length) return null;

    // if (fields.length === 1) {
    //   return (
    //     <>
    //       <Field
    //         name={`${fields.name}[0].address`}
    //         component={RecipientField}
    //         change={change}
    //         sendFrom={sendFrom}
    //       />
    //       <AmountField
    //         fullAmount={accBalance}
    //         parentFieldName={`${fields.name}[0]`}
    //         change={change}
    //         token={token}
    //       />
    //     </>
    //   );
    // } else {
    return (
      <>
        {fields.map((fieldName, i) => (
          <Recipient
            key={i}
            style={fields.length > 1 ? { marginTop: '0.5em' } : undefined}
          >
            {fields.length !== 1 && (
              <Tooltip.Trigger tooltip={__('Remove recipient')}>
                <RemoveButton
                  onClick={() => {
                    fields.remove(i);
                  }}
                >
                  ✕
                </RemoveButton>
              </Tooltip.Trigger>
            )}

            <div className="flex center">
              <AddressWrapper>
                <Field
                  name={`${fieldName}.address`}
                  component={RecipientField}
                  change={change}
                  source={source}
                />
              </AddressWrapper>

              <AmountWrapper>
                <AmountField
                  parentFieldName={fieldName}
                  change={change}
                  source={source}
                />
              </AmountWrapper>
            </div>

            {advancedOptions && <AdvancedFields parentFieldName={fieldName} />}
          </Recipient>
        ))}
      </>
    );
    // }
  }
}
export default Recipients;
