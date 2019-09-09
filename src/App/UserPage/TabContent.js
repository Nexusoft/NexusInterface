import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { Route, Redirect, Switch } from 'react-router';

import Balances from './Balances';

const TabContentComponent = styled.div({
  flexGrow: 1,
  flexShrink: 1,
});

let SettingsRedirect = ({ lastActiveTab, match }) => (
  <Redirect
    exact
    from={`${match.path}/`}
    to={`${match.path}/${lastActiveTab}`}
  />
);
SettingsRedirect = connect(({ ui: { user: { lastActiveTab } } }) => ({
  lastActiveTab,
}))(SettingsRedirect);

const TabContent = ({ match }) => (
  <TabContentComponent>
    <Switch>
      <Route path={`${match.url}/Balances`} component={Balances} />
      <SettingsRedirect match={match} />
    </Switch>
  </TabContentComponent>
);

export default TabContent;
