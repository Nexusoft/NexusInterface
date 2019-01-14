import { connect } from 'react-redux';
import { getMessages } from 'utils/language';

const en = getMessages('en');

function messageTemplate(rawMessage, data) {
  return Object.keys(data).reduce(
    (msg, key) => msg.replace(`{${key}}`, data[key]),
    rawMessage
  );
}

export function translate(id, locale, data) {
  const rawMessage = getMessages(locale)[id] || en[id] || id || '';
  const message = data ? messageTemplate(rawMessage, data) : rawMessage;
  return message;
}

const Text = ({ id, locale, data, children }) => {
  const message = translate(id, locale, data);

  if (typeof children === 'function') {
    return children(message);
  } else {
    return message;
  }
};

const mapStateToProps = state => ({
  locale: state.settings.settings.locale,
});

export default connect(mapStateToProps)(Text);
