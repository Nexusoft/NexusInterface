import React, { Component } from 'react';

import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  locale: state.settings.locale,
});

class IntlWrapper extends Component {
  static defaultProps = {
    locale: 'en',
  };

  render() {
    return (
      <IntlProvider locale={this.props.locale} defaultLocale="en">
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default connect(mapStateToProps)(IntlWrapper);
