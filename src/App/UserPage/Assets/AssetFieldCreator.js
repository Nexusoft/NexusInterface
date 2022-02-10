import styled from '@emotion/styled';

import Form from 'components/Form';
import FormField from 'components/FormField';
import Tooltip from 'components/Tooltip';
import QuestionCircle from 'components/QuestionCircle';
import { useFieldValue, required } from 'lib/form';
import { consts, timing } from 'styles';
import { assetNumberTypes } from 'consts/misc';

__ = __context('CreateAsset');

const typeOptions = [
  {
    value: 'string',
    display: 'string',
  },
  {
    value: 'uint8',
    display: 'uint8',
  },
  {
    value: 'uint16',
    display: 'uint16',
  },
  {
    value: 'uint32',
    display: 'uint32',
  },
  {
    value: 'uint64',
    display: 'uint64',
  },
  {
    value: 'uint256',
    display: 'uint256',
  },
  {
    value: 'uint512',
    display: 'uint512',
  },
  {
    value: 'uint1024',
    display: 'uint1024',
  },
];

const FieldWrapper = styled.div({
  marginLeft: -50,
  paddingLeft: 50,
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1fr 2fr 60px 115px 100px',
  columnGap: '1em',
  alignItems: 'stretch',
});

const RemoveButton = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 'calc(50% - 13px)',
  left: 0,
  fontSize: 16,
  padding: 10,
  lineHeight: 1,
  color: theme.mixer(0.5),
  opacity: 0,
  cursor: 'pointer',
  transition: `color ${timing.normal}, opacity ${timing.normal}`,
  '&:hover': {
    color: theme.mixer(0.75),
  },
  [`${FieldWrapper}:hover &`]: {
    opacity: 1,
  },
}));

const SwitchWrapper = styled.div({
  height: consts.inputHeightEm + 'em',
  display: 'flex',
  alignItems: 'center',
});

const ConditionalFormField = ({ showLabel, label, children, ...rest }) =>
  showLabel ? (
    <FormField label={label} capitalizeLabel {...rest}>
      <div style={{ marginTop: '.75em' }}>{children}</div>
    </FormField>
  ) : (
    children
  );

export default function AssetFieldCreator({
  fieldName,
  first,
  remove,
  onlyField,
}) {
  const fieldValue = useFieldValue(fieldName);
  const lengthDisabled = !(fieldValue.mutable && fieldValue.type === 'string');

  return (
    <FieldWrapper className={first ? undefined : 'mt1'}>
      <ConditionalFormField showLabel={first} label={__('Name')}>
        <Form.TextField
          name={`${fieldName}.name`}
          placeholder={__('Field name')}
          validate={required()}
        />
      </ConditionalFormField>

      <ConditionalFormField showLabel={first} label={__('Value')}>
        <Form.TextField
          name={`${fieldName}.value`}
          placeholder={__('Field value')}
          type={assetNumberTypes.includes(fieldValue.type) ? 'number' : 'text'}
          min={assetNumberTypes.includes(fieldValue.type) ? 0 : undefined}
        />
      </ConditionalFormField>

      <ConditionalFormField showLabel={first} label={__('Mutable')}>
        <SwitchWrapper>
          <Form.Switch name={`${fieldName}.mutable`} />
        </SwitchWrapper>
      </ConditionalFormField>

      <ConditionalFormField showLabel={first} label={__('Type')}>
        <Form.Select name={`${fieldName}.type`} options={typeOptions} />
      </ConditionalFormField>

      <ConditionalFormField
        showLabel={first}
        label={
          <span>
            <span className="v-align">{__('Max. length')}</span>
            <QuestionCircle
              tooltip={__('Only applicable to mutable string fields')}
            />
          </span>
        }
        className={lengthDisabled ? 'dim' : undefined}
      >
        <Form.TextField
          name={`${fieldName}.maxlength`}
          type="number"
          disabled={lengthDisabled}
          placeholder={lengthDisabled ? 'N/A' : __('Unlimited')}
        />
      </ConditionalFormField>

      {!onlyField && (
        <Tooltip.Trigger tooltip={__('Remove field')}>
          <RemoveButton onClick={remove}>✕</RemoveButton>
        </Tooltip.Trigger>
      )}
    </FieldWrapper>
  );
}
