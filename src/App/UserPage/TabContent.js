import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { Route, Redirect, Switch } from 'react-router';

import Staking from './Staking';
import Accounts from './Accounts';
import Tokens from './Tokens';
import Names from './Names';
// import Namespaces from './Namespaces';

const TabContentComponent = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  paddingLeft: 30,
  overflow: 'auto',
});

let UserRedirect = ({ lastActiveTab, match }) => (
  <Redirect
    exact
    from={`${match.path}/`}
    to={`${match.path}/${lastActiveTab}`}
  />
);
UserRedirect = connect(({ ui: { user: { lastActiveTab } } }) => ({
  lastActiveTab,
}))(UserRedirect);

const TabContent = ({ match }) => (
  <TabContentComponent>
    <Switch>
      <Route path={`${match.url}/Staking`} component={Staking} />
      <Route path={`${match.url}/Accounts`} component={Accounts} />
      <Route path={`${match.url}/Tokens`} component={Tokens} />
      <Route path={`${match.url}/Names`} component={Names} />
      {/* <Route path={`${match.url}/Namespaces`} component={Namespaces} />  */}
      <UserRedirect match={match} />
    </Switch>
  </TabContentComponent>
);

export default TabContent;
