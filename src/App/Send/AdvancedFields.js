import { useSelector } from 'react-redux';

import FormField from 'components/FormField';
import Form from 'components/Form';
import QuestionCircle from 'components/QuestionCircle';
import { useFieldValue } from 'lib/form';
import { timeToText } from 'utils/misc';

__ = __context('Send');

const numberInputProps = {
  type: 'number',
  min: 0,
  skin: 'filled-inverted',
  style: { maxWidth: 80 },
};

const uintRegex = /^[0-9]+$/;

function validateReference(value) {
  if (value) {
    if (!uintRegex.test(value)) {
      return __('Reference must be an unsigned integer');
    }
  }
}

export default function AdvancedFields() {
  const txExpiry = useSelector((state) => state.core.config?.txExpiry);
  const turnedOn = useFieldValue('advancedOptions');

  if (!turnedOn) return null;

  return (
    <div className="flex center space-between">
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
          <Form.TextField
            skin="filled-inverted"
            name="reference"
            placeholder={__('Reference number (optional)')}
            validate={validateReference}
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
                  'The amount of time since the transaction is created after which the transaction can no longer be credited by the recipient. By default, transactions will expire in %{time}',
                  {
                    time: `${timeToText(txExpiry)} `,
                  }
                )}
              />
            </span>
          }
        ></FormField>

        <FormField label={__('Days')} className="ml1">
          <Form.TextField name={'expiry.expireDays'} {...numberInputProps} />
        </FormField>

        <FormField label={__('Hours')} className="ml0_4">
          <Form.TextField name={'expiry.expireHours'} {...numberInputProps} />
        </FormField>

        <FormField label={__('Minutes')} className="ml0_4">
          <Form.TextField name={'expiry.expireMinutes'} {...numberInputProps} />
        </FormField>

        <FormField label={__('Seconds')} className="ml0_4">
          <Form.TextField name={'expiry.expireSeconds'} {...numberInputProps} />
        </FormField>
      </div>
    </div>
  );
}
