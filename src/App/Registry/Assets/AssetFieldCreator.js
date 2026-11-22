import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';
import Icon from 'components/Icon';
import trashIcon from 'icons/trash.svg';

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
}, ({ theme }) => theme.modern && ({
  marginLeft: 0, marginTop: 12, padding: 18, borderRadius: 14,
  border: `1px solid ${fade(theme.primary, 0.82)}`, background: fade(theme.primary, 0.975),
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 16,
  '&& [data-form-field]': { marginTop: 0, minWidth: 0 },
  '> [data-form-field]:nth-of-type(3)': { gridColumn: 'span 2' },
  '.field-heading': { gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: theme.primary, fontSize: 12, fontWeight: 500, minHeight: 28 },
  '@media (max-width: 540px)': { gridTemplateColumns: 'minmax(0, 1fr)', '> [data-form-field]:nth-of-type(3)': { gridColumn: 'auto' } },
}));

const RemoveButton = styled.button(({ theme }) => ({
  border: 0, background: 'transparent',
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
  [`${FieldWrapper}:hover &`]: { opacity: 1 },
  '&:focus-visible': { opacity: 1, outline: `2px solid ${theme.primary}`, outlineOffset: 2 },
  ...(theme.modern && { position: 'static', opacity: 1, padding: 6, color: theme.mixer(0.65), borderRadius: 6, '&:hover': { color: theme.danger, background: fade(theme.danger, 0.9) } }),
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
  index = 0,
}) {
  const { modern } = useTheme();
  const fieldValue = useFieldValue(fieldName);
  const lengthDisabled = !(fieldValue.mutable && fieldValue.type === 'string');

  return (
    <FieldWrapper className={first ? undefined : 'mt1'}>
      {modern && <div className="field-heading"><span>{__('Field %{number}', { number: index + 1 })}</span>{!onlyField && <RemoveButton type="button" aria-label={__('Remove field')} onClick={remove}><Icon icon={trashIcon} /></RemoveButton>}</div>}
      <ConditionalFormField showLabel={modern || first} label={__('Name')}>
        <Form.TextField
          name={`${fieldName}.name`} aria-label={__('Field name')}
          placeholder={__('Field name')}
          validate={required()}
        />
      </ConditionalFormField>

      <ConditionalFormField showLabel={modern || first} label={__('Value')}>
        <Form.TextField
          name={`${fieldName}.value`} aria-label={__('Field value')}
          placeholder={__('Field value')}
          type={assetNumberTypes.includes(fieldValue.type) ? 'number' : 'text'}
          min={assetNumberTypes.includes(fieldValue.type) ? 0 : undefined}
        />
      </ConditionalFormField>

      <ConditionalFormField showLabel={modern || first} label={__('Mutable')}>
        <SwitchWrapper>
          <Form.Switch name={`${fieldName}.mutable`} aria-label={__('Mutable')} />
        </SwitchWrapper>
      </ConditionalFormField>

      <ConditionalFormField showLabel={modern || first} label={__('Type')}>
        <Form.Select name={`${fieldName}.type`} aria-label={__('Type')} options={typeOptions} />
      </ConditionalFormField>

      <ConditionalFormField
        showLabel={modern || first}
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
          name={`${fieldName}.maxlength`} aria-label={__('Max. length')}
          type="number"
          disabled={lengthDisabled}
          placeholder={lengthDisabled ? 'N/A' : __('Unlimited')}
        />
      </ConditionalFormField>

      {!modern && !onlyField && (
        <Tooltip.Trigger tooltip={__('Remove field')}>
          <RemoveButton type="button" aria-label={__('Remove field')} onClick={remove}>✕</RemoveButton>
        </Tooltip.Trigger>
      )}
    </FieldWrapper>
  );
}

