// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import GA from 'lib/googleAnalytics';

// Internal Global Dependencies
import Icon from 'components/Icon';
import Panel from 'components/Panel';

//Invoice
import InvoiceForm from './InvoiceForm';

import nexusIcon from 'icons/NXS_coin.svg';

__ = __context('Invoice');

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.core,
  };
};

/**
 * Invoice Page
 *
 * @class Invoice
 * @extends {Component}
 */
class Invoice extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    GA.SendScreen('Invoice');
  }

  render() {
    return (
      <Panel icon={nexusIcon} title={__('Invoice')}>
        {'Test Body'}
        <InvoiceForm />
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(mapStateToProps)(Invoice);
