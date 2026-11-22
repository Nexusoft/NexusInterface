import styled from '@emotion/styled';
import { Routes, Route, Navigate } from 'react-router-dom';

import Accounts from './Accounts';
import themeStyles from 'utils/themeStyles';

const TabContentComponent = styled.div(themeStyles([{
  flexGrow: 1,
  flexShrink: 1,
  paddingLeft: 30,
  overflow: 'auto'
}], [{
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  padding: '4px 4px 20px',
  overflow: 'auto',
  '@media (max-width: 900px)': {
    overflow: 'visible'
  }
}]));

function UserRedirect() {
  return <Navigate to="Accounts" replace />;
}

export default function TabContent() {
  return (
    <TabContentComponent>
      <Routes>
        <Route path="Accounts" element={<Accounts />} />
        <Route path="*" element={<UserRedirect />} />
      </Routes>
    </TabContentComponent>
  );
}
