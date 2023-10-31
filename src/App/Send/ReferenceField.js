import styled from '@emotion/styled';

import FormField from 'components/FormField';
import Form from 'components/Form';
import QuestionCircle from 'components/QuestionCircle';
import { useFieldValue } from 'lib/form';

__ = __context('Send');

const uintRegex = /^[0-9]+$/;

function validateReference(value) {
  if (value) {
    if (!uintRegex.test(value)) {
      return __('Reference must be an unsigned integer');
    }
  }
}

const ReferenceFieldWrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
});

export default function ReferenceField({ parentFieldName }) {
  const turnedOn = useFieldValue('advancedOptions');

  if (!turnedOn) return null;

  return (
    <ReferenceFieldWrapper className="mb0_4">
      <FormField
        style={{ width: '100%' }}
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
          name={`${parentFieldName}.reference`}
          placeholder={__('Ref. number (optional)')}
          validate={validateReference}
        />
      </FormField>
    </ReferenceFieldWrapper>
  );
}
