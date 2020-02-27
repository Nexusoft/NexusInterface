import React from 'react';
import { Field, Fields } from 'redux-form';
import styled from '@emotion/styled';

import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import Select from 'components/Select';
import { consts } from 'styles';
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

const AssetFieldCreator = ({ fieldName, first }) => (
  <div className={first ? undefined : 'mt2'}>
    <FirstLine>
      <FormField label={__('Name')} connectLabel capitalizeLabel>
        <Field
          name={`${fieldName}.name`}
          component={TextField.RF}
          placeholder={__('Field name')}
        />
      </FormField>
      <span className="space-left space-right">:</span>
      <FormField label={__('Value')} connectLabel capitalizeLabel>
        <Field
          name={`${fieldName}.value`}
          component={TextField.RF}
          placeholder={__('Field value')}
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
      <Fields
        names={[`${fieldName}.mutable`, `${fieldName}.type`]}
        component={fields => {
          const mutable = getDeep(fields, `${fieldName}.mutable`);
          const type = getDeep(fields, `${fieldName}.type`);
          const disabled = !(
            mutable.input.value && type.input.value === 'string'
          );
          return (
            <FormField
              label={__('Max. length')}
              connectLabel
              capitalizeLabel
              className={disabled ? 'dim' : undefined}
            >
              <Field
                name={`${fieldName}.maxlength`}
                type="number"
                component={TextField.RF}
                disabled={disabled}
                placeholder={__('Maximum length')}
              />
            </FormField>
          );
        }}
      />
    </SecondLine>
  </div>
);

export default AssetFieldCreator;
