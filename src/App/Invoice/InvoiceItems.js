// External
import React from 'react';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';
import RecipientField from '../SendTritium/RecipientField';
import InvoiceItem from './invoiceItem';
import AmountField from '../SendTritium/AmountField';
import { subtract } from 'utils/calc';

__ = __context('Invoice Item List');

const RemoveButton = styled.div(({ theme }) => ({
  position: 'absolute',
  left: `0.75em`,
  marginTop: '1.5em',
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

const MoreInfo = styled.div({
  marginTop: '1em',
  marginBottom: '1.5em',
  display: 'flex',
  justifyContent: 'space-between',
});

const PlusIcon = styled(Icon)({
  fontSize: '.8em',
});

const TableHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto 8em 5em 10em',
  gridTemplateRows: 'auto',
  gridGap: '1em 1em',
});

/**
 * Recipients Field from the Send Page
 *
 * @class Recipients
 * @extends {React.Component}
 */
class InvoiceItems extends React.Component {
  returnHeader() {
    return (
      <TableHeader>
        <div style={{ width: '5em', textAlign: 'center' }}>
          {__('Description')}
        </div>
        <div style={{ textAlign: 'center' }}>{__('Unit Cost')}</div>
        <div style={{ textAlign: 'center' }}>{__('Units')}</div>
        <div style={{ textAlign: 'center' }}>{__('Total')}</div>
      </TableHeader>
    );
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Recipients
   */
  render() {
    const { fields, change, addInvoiceItem, accBalance } = this.props;

    if (!fields) return null;

    return (
      <>
        {this.returnHeader()}
        {fields.map((fieldName, i) => (
          <div key={i}>
            <Tooltip.Trigger tooltip={__('Remove Item')}>
              <RemoveButton
                onClick={() => {
                  fields.remove(i);
                }}
              >
                ✕
              </RemoveButton>
            </Tooltip.Trigger>

            <Field
              name={`items[${i}]`}
              component={InvoiceItem}
              change={change}
            />
          </div>
        ))}

        <MoreInfo>
          <Button skin="hyperlink" onClick={addInvoiceItem}>
            <PlusIcon icon={plusIcon} className="space-right" />
            <span className="v-align">{__('Add Item')}</span>
          </Button>
        </MoreInfo>
      </>
    );
  }
}
export default InvoiceItems;
