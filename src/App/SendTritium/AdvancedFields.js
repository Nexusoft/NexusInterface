import { Field } from 'redux-form';

import FormField from 'components/FormField';
import TextField from 'components/TextField';
import QuestionCircle from 'components/QuestionCircle';
import { numericOnly } from 'utils/form';

__ = __context('Send');

const numberInputProps = {
  component: TextField.RF,
  type: 'number',
  min: 0,
  style: { maxWidth: 80 },
};

export default function AdvancedFields({ parentFieldName }) {
  return (
    <div className="flex center space-between" style={{ marginTop: -8 }}>
      <div className="flex1 mr2">
        <FormField
          label={
            <span>
              <span className="v-align">{__('Reference')}</span>
              <QuestionCircle
                tooltip={__(
                  'An optional number which may be provided by the recipient to identify this transaction from the others, e.g. invoice number, order number, etc.'
                )}
              />
            </span>
          }
        >
          <Field
            skin="filled-inverted"
            component={TextField.RF}
            name={`${parentFieldName}.reference`}
            normalize={numericOnly}
            placeholder={__('Reference number (optional)')}
          />
        </FormField>
      </div>

      <div className="flex">
        <FormField
          label={
            <span>
              <span className="v-align">{__('Expires in')}</span>
              <QuestionCircle
                tooltip={__(
                  'The amount of time since the transaction is created after which the transaction can no longer be credited by the recipient. By default, transactions will expire in 1 day (86400 seconds).'
                )}
              />
            </span>
          }
        ></FormField>

        <FormField label={__('Days')} className="ml1">
          <Field
            skin="filled-inverted"
            {...numberInputProps}
            name={`${parentFieldName}.expireDays`}
          />
        </FormField>

        <FormField label={__('Hours')} className="ml0_4">
          <Field
            skin="filled-inverted"
            {...numberInputProps}
            name={`${parentFieldName}.expireHours`}
          />
        </FormField>

        <FormField label={__('Minutes')} className="ml0_4">
          <Field
            skin="filled-inverted"
            {...numberInputProps}
            name={`${parentFieldName}.expireMinutes`}
          />
        </FormField>

        <FormField label={__('Seconds')} className="ml0_4">
          <Field
            skin="filled-inverted"
            {...numberInputProps}
            name={`${parentFieldName}.expireSeconds`}
          />
        </FormField>
      </div>
    </div>
  );
}
