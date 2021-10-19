// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import { isLoggedIn } from 'selectors';
import { history } from 'lib/wallet';
import { legacyMode } from 'consts/misc';
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

export default function UserPage({ match }) {
  const loggedIn = useSelector(isLoggedIn);

  useEffect(() => {
    if (legacyMode) {
      history.push('/');
    }
    GA.SendScreen('UserPage');
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
          <UserBrief match={match} />
          <TabContent match={match} />
        </UserPageLayout>
      </RequireLoggedIn>
    </Panel>
  );
}
