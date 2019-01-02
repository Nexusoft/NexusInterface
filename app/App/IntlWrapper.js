import React, { Component } from 'react';

import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  locale: state.settings.settings.locale,
  messages: state.settings.messages,
});

class IntlWrapper extends Component {
  static defaultProps = {
    locale: 'en',
    messages: {},
  };

  render() {
    return (
      <IntlProvider
        locale={this.props.locale}
        messages={this.props.messages}
        defaultLocale="en"
      >
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default connect(mapStateToProps)(IntlWrapper);
