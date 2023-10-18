import FormField from 'components/FormField';
import Form from 'components/Form';
import QuestionCircle from 'components/QuestionCircle';
import { useFieldValue } from 'lib/form';

__ = __context('Send');

const numberInputProps = {
  type: 'number',
  min: 0,
  skin: 'filled-inverted',
  style: { maxWidth: 80 },
};

export default function ExpiryFields() {
  const turnedOn = useFieldValue('advancedOptions');

  if (!turnedOn) return null;

  return (
    <div className="flex center justify-end mt1">
      <div className="flex">
        <FormField
          label={
            <span>
              <span className="v-align">{__('Expires in')}</span>
              <QuestionCircle
                tooltip={__(
                  'The amount of time since the transaction is created after which the transaction can no longer be credited by the recipient.'
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
