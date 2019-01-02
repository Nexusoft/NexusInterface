import React from 'react';
import { FormattedMessage, formatMessage } from 'react-intl';
import { getMessages } from 'utils/language';

const en = getMessages('en');

const Text = ({ id, ...rest }) => (
  <FormattedMessage id={id} defaultMessage={en[id]} {...rest} />
);

export function text(id, values) {
  return formatMessage({ id, defaultMessage: en[id] }, values);
}

export default Text;
