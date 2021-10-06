import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Route, Redirect, Switch } from 'react-router';

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

function UserRedirect({ lastActiveTab, match }) {
  const lastActiveTab = useSelector((state) => state.ui.user.lastActiveTab);
  return (
    <Redirect
      exact
      from={`${match.path}/`}
      to={`${match.path}/${lastActiveTab}`}
    />
  );
}

export default function TabContent({ match }) {
  return (
    <TabContentComponent>
      <Switch>
        <Route path={`${match.url}/Staking`} component={Staking} />
        <Route path={`${match.url}/Accounts`} component={Accounts} />
        <Route path={`${match.url}/Tokens`} component={Tokens} />
        <Route path={`${match.url}/Names`} component={Names} />
        <Route path={`${match.url}/Namespaces`} component={Namespaces} />
        <Route path={`${match.url}/Assets`} component={Assets} />
        <UserRedirect match={match} />
      </Switch>
    </TabContentComponent>
  );
}
