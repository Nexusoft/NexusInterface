// External
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';
import RecipientAddress from './RecipientAddress';
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

export default function Recipients({ fields }) {
  if (!fields || !fields.length) return null;

  if (fields.length === 1) {
    return (
      <>
        <RecipientAddress fieldName={`${fields.name}[0].address`} />
        <AmountField parentFieldName={`${fields.name}[0]`} />
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
              <RecipientAddress fieldName={`${fieldName}.address`} />
            </AddressWrapper>

            <AmountWrapper>
              <AmountField parentFieldName={fieldName} hideSendAll />
            </AmountWrapper>
          </Recipient>
        ))}

        <MoreInfo>
          <Button
            skin="hyperlink"
            onClick={() => {
              fields.push({
                address: null,
                amount: '',
                fiatAmount: '',
              });
            }}
          >
            <PlusIcon icon={plusIcon} className="mr0_4" />
            <span className="v-align">{__('Add recipient')}</span>
          </Button>
        </MoreInfo>
      </>
    );
  }
}
