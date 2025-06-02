// External
import { useEffect } from 'react';
import styled from '@emotion/styled';
import UT from 'lib/usageTracking';
import { useAtomValue } from 'jotai';

// Internal Global
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import { loggedInAtom } from 'lib/session';
import userIcon from 'icons/user.svg';

// Internal Local
import UserBrief from './UserBrief';
import TabContent from './TabContent';
import UserOptions from './UserOptions';

__ = __context('User');

const UserPageLayout = styled.div({
  display: 'flex',
  alignItems: 'stretch',
  height: '100%',
});

export default function UserPage() {
  const loggedIn = useAtomValue(loggedInAtom);

  useEffect(() => {
    UT.SendScreen('UserPage');
  }, []);

  return (
    <Panel
      icon={userIcon}
      title={__('User')}
      bodyScrollable={false}
      controls={loggedIn ? <UserOptions /> : undefined}
    >
      <RequireLoggedIn>
        <UserPageLayout>
          <UserBrief />
          <TabContent />
        </UserPageLayout>
      </RequireLoggedIn>
    </Panel>
  );
}
