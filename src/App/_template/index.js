// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal Global Dependencies
import Icon from 'components/Icon';
import Panel from 'components/Panel';

import nexusIcon from 'icons/NXS_coin.svg';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.core,
  };
};

/**
 * A Template for a Internal Wallet Page
 *
 * @class Template
 * @extends {Component}
 */
class Template extends Component {
  render() {
    return (
      <Panel icon={nexusIcon} title={'Template'}>
        {'Test Body'}
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(mapStateToProps)(Template);
