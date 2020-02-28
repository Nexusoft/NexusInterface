import React from 'react';
import { connect } from 'react-redux';
import { Field, getFormValues } from 'redux-form';
import styled from '@emotion/styled';

import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import Select from 'components/Select';
import Tooltip from 'components/Tooltip';
import QuestionCircle from 'components/QuestionCircle';
import { consts, timing } from 'styles';
import { getDeep } from 'utils/misc';

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

const numberTypes = [
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uint256',
  'uint512',
  'uint1024',
];

const minValue = {
  string: undefined,
  uint8: 0,
  uint16: 0,
  uint32: 0,
  uint64: 0,
  uint256: 0,
  uint512: 0,
  uint1024: 0,
};

const FieldWrapper = styled.div({
  marginLeft: -50,
  paddingLeft: 50,
  position: 'relative',
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

const FirstLine = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr min-content 2fr',
  columnGap: '.6em',
  alignItems: 'end',
});

const SecondLine = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr min-content 1fr',
  columnGap: '.6em',
  alignItems: 'stretch',
});

const SwitchWrapper = styled.div({
  height: consts.inputHeightEm + 'em',
  display: 'flex',
  alignItems: 'center',
});

@connect((state, props) => ({
  fieldValue: getDeep(getFormValues(props.form)(state), props.fieldName),
}))
export default class AssetFieldCreator extends React.PureComponent {
  render() {
    const { fieldName, first, fieldValue, remove, onlyField } = this.props;
    const lengthDisabled = !(
      fieldValue.mutable && fieldValue.type === 'string'
    );

    return (
      <FieldWrapper className={first ? undefined : 'mt2'}>
        <FirstLine>
          <FormField label={__('Name')} connectLabel capitalizeLabel>
            <Field
              name={`${fieldName}.name`}
              component={TextField.RF}
              placeholder={__('Field name')}
            />
          </FormField>
          <span className="space-left space-right">=</span>
          <FormField label={__('Value')} connectLabel capitalizeLabel>
            <Field
              name={`${fieldName}.value`}
              component={TextField.RF}
              placeholder={__('Field value')}
              type={numberTypes.includes(fieldValue.type) ? 'number' : 'text'}
              min={minValue[fieldValue.type]}
            />
          </FormField>
        </FirstLine>

        <SecondLine>
          <FormField
            label={__('Type')}
            connectLabel
            capitalizeLabel
            className="space-right"
          >
            <Field
              name={`${fieldName}.type`}
              component={Select.RF}
              options={typeOptions}
            />
          </FormField>
          <FormField
            label={__('Mutable')}
            connectLabel
            capitalizeLabel
            className="space-right"
          >
            {inputId => (
              <SwitchWrapper>
                <Field
                  name={`${fieldName}.mutable`}
                  component={Switch.RF}
                  id={inputId}
                />
              </SwitchWrapper>
            )}
          </FormField>
          <FormField
            label={
              <span>
                <span className="v-align">{__('Max. length')}</span>
                <QuestionCircle
                  tooltip={__('Only applicable to mutable string fields')}
                />
              </span>
            }
            connectLabel
            capitalizeLabel
            className={lengthDisabled ? 'dim' : undefined}
          >
            <Field
              name={`${fieldName}.maxlength`}
              type="number"
              component={TextField.RF}
              disabled={lengthDisabled}
              placeholder={__('Maximum length')}
            />
          </FormField>
        </SecondLine>

        {!onlyField && (
          <Tooltip.Trigger tooltip={__('Remove field')}>
            <RemoveButton onClick={remove}>✕</RemoveButton>
          </Tooltip.Trigger>
        )}
      </FieldWrapper>
    );
  }
}
