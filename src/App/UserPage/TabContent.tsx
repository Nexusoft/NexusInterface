import styled from '@emotion/styled';
import { Routes, Route, Navigate } from 'react-router';
import { useAtomValue } from 'jotai';

import { lastActiveTabAtom } from './atoms';
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
  const lastActiveTab = useAtomValue(lastActiveTabAtom);
  return <Navigate to={lastActiveTab} replace />;
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
        <Route path="*" element={<UserRedirect />} />
      </Routes>
    </TabContentComponent>
  );
}
