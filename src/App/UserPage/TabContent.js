import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Route, Redirect, Switch } from 'react-router';
import { useRouteMatch, Routes } from 'react-router-dom';

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

function UserRedirect() {
  const match = useRouteMatch();
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
  return (
    <TabContentComponent>
      <Routes>
        <Route path="Staking" element={<Staking />} />
        <Route path="Accounts" element={<Accounts />} />
        <Route path="Tokens" element={<Tokens />} />
        <Route path="Names" element={<Names />} />
        <Route path="Namespaces" element={<Namespaces />} />
        <Route path="Assets" element={<Assets />} />
        <Route element={<UserRedirect />} />
      </Routes>
    </TabContentComponent>
  );
}
