// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal

import Panel from 'components/Panel';
import UserPanel from './UserPanel';
import AccountsPanel from './AccountsPanel';

const PanelHolder = styled.div({
  display: 'flex',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common, ...state.tritiumData };
};
const mapDispatchToProps = dispatch => ({});

class Accounts extends Component {
  // Mandatory React method
  render() {
    return (
      <Panel title={'Accounts'}>
        <div>
          <PanelHolder>
            <UserPanel
              userGen={this.props.userGenesis}
              userName={this.props.userName}
            />
            <AccountsPanel />
          </PanelHolder>
        </div>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Accounts);
