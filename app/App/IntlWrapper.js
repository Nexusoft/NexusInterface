import React, { Component } from 'react';

import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  locale: state.settings.locale,
});

/**
 * Local Wrapper 
 *
 * @class IntlWrapper
 * @extends {Component}
 */
class   extends Component {
  static defaultProps = {
    locale: 'en',
  };

  /**
   * React Render
   *
   * @returns
   */
  render() {
    return (
      <IntlProvider locale={this.props.locale} defaultLocale="en">
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default connect(mapStateToProps)(IntlWrapper);
