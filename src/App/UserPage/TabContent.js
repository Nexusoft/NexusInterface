import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Route, Redirect, Switch } from 'react-router';
import { useRouteMatch } from 'react-router-dom';

import Staking from './Staking';
import Accounts from './Accounts';
import Tokens from './Tokens';
import Names from './Names';
import Namespaces from './Namespaces';
import Assets from './Assets';

const TabContentComponent = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  paddingLeft: 30,
  overflow: 'auto',
});

function UserRedirect({ match }) {
  const lastActiveTab = useSelector((state) => state.ui.user.lastActiveTab);
  return (
    <Redirect
      exact
      from={`${match.path}/`}
      to={`${match.path}/${lastActiveTab}`}
    />
  );
}

export default function TabContent() {
  const match = useRouteMatch();
  return (
    <TabContentComponent>
      <Switch>
        <Route path={`${match.url}/Staking`}>
          <Staking />
        </Route>
        <Route path={`${match.url}/Accounts`}>
          <Accounts />
        </Route>
        <Route path={`${match.url}/Tokens`}>
          <Tokens />
        </Route>
        <Route path={`${match.url}/Names`}>
          <Names />
        </Route>
        <Route path={`${match.url}/Namespaces`}>
          <Namespaces />
        </Route>
        <Route path={`${match.url}/Assets`}>
          <Assets />
        </Route>
        <Route render={() => <UserRedirect match={match} />} />
      </Switch>
    </TabContentComponent>
  );
}
