// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import UT from 'lib/usageTracking';

// Internal Global
import { selectUsername } from 'lib/session';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import RequireLoggedIn from 'components/RequireLoggedIn';
import { isLoggedIn } from 'selectors';
import userIcon from 'icons/user.svg';
import profileCardIcon from 'icons/profile-card.svg';
import { consts } from 'styles';
import Icon from 'components/Icon';
import { fade } from 'utils/color';
import { moduleLayout, modulePanel, moduleAction } from 'utils/moduleStyles';

// Internal Local
import UserOptions from './UserOptions';
import ProfileDetails, { RecoveryStatus, UserCreationDate } from './ProfileDetails';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { clipboard } from 'electron';
import { showNotification } from 'lib/ui';
import copyIcon from 'icons/copy.svg';
import Panel from 'components/Panel';

import { useTheme } from '@emotion/react';

__ = __context('User');

const UserPageSurface = styled.section(({ theme }) => ({
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'auto',
  ...modernGridBackground(theme),
  color: theme.foreground,
}));

const PageBody = styled.div(({ theme }) => ({
  position: 'relative', zIndex: 1, flex: '1 0 auto', display: 'flex', flexDirection: 'column',
  minWidth: 0, padding: moduleLayout.pagePadding, gap: moduleLayout.gap,
  containerType: 'inline-size', containerName: 'user-module',
  '.user-workspace': { flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: moduleLayout.gap, alignItems: 'stretch' },
  '.profile-card': { ...modulePanel(theme), borderColor: fade(theme.primary, 0.65), padding: moduleLayout.panelPadding, minWidth: 0 },
  '.profile-card h2': { display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px', fontSize: moduleLayout.sectionTitleSize, fontWeight: 600 },
  '.profile-description': { margin: 0, paddingBottom: 20, borderBottom: `1px solid ${fade(theme.primary, 0.75)}`, fontSize: 12, lineHeight: 1.5, color: theme.mixer(0.7) },
  '.profile-card h2 svg': { color: theme.primary, width: 20, height: 20, flexShrink: 0 },
  '.profile-card dl': { margin: 0 },
  '.profile-card dl > div': { padding: '16px 0', borderBottom: `1px solid ${fade(theme.primary, 0.85)}` },
  '.profile-card dl > div:last-child': { borderBottom: 0 },
  '.profile-card dt': { fontSize: 11, color: theme.mixer(0.65), marginBottom: 8 },
  '.profile-card dd': { margin: 0, fontSize: 13, color: theme.foreground, overflowWrap: 'anywhere' },
  '.user-id': { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  '.user-id-value': { flex: '0 1 auto', minWidth: 0, fontFamily: consts.monoFontFamily, fontSize: 12, overflowWrap: 'anywhere', lineHeight: 1.7, userSelect: 'text' },
  '.user-id button': { flexShrink: 0 },
  '@container user-module (max-width: 1000px)': { '.user-workspace': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.profile-card dl': { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0 24px' }, '.profile-card .identity-row': { gridColumn: '1 / -1' } },
  '@container user-module (max-width: 480px)': { '.profile-card dl': { gridTemplateColumns: 'minmax(0, 1fr)' } },
}));

const PageHeader = styled.header(({ theme }) => ({
  ...modulePanel(theme), display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: moduleLayout.compactPadding, flexShrink: 0,
  '.user-heading': { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 },
  '.profile-title': { minWidth: 0 },
  h1: { margin: 0, fontSize: moduleLayout.titleSize, fontWeight: 600, lineHeight: 1.3, color: theme.foreground },
  p: { margin: '4px 0 0', fontSize: 12, lineHeight: 1.5, color: theme.mixer(0.7) },
  '.user-security-actions': { display: 'flex', gap: 8, flexWrap: 'wrap' },
  '.user-security-actions button': { ...moduleAction, display: 'inline-flex', alignItems: 'center', gap: 8 },
  '@container user-module (max-width: 600px)': { padding: 16, '.user-security-actions': { width: '100%' }, '.user-security-actions button': { flex: '1 1 180px' } },
}));

export default function UserPage() {
  const { modern } = useTheme();
  const loggedIn = useSelector(isLoggedIn);
  const username = useSelector(selectUsername);
  const genesis = useSelector((state) => state.user.status?.genesis);

  useEffect(() => {
    UT.SendScreen('UserPage');
  }, []);

  return (
    modern ? (<UserPageSurface>
      <GridTracers />
      <PageBody>
        {loggedIn && <PageHeader>
          <div className="user-heading"><div className="profile-title"><h1>{__('User profile')}</h1><p>{__('Manage your identity and security.')}</p></div></div>
          <UserOptions buttons />
        </PageHeader>}
        <RequireLoggedIn>
          <div className="user-workspace">
            <section className="profile-card" aria-labelledby="profile-details-title">
              <h2 id="profile-details-title"><Icon icon={profileCardIcon} aria-hidden="true" />{__('Profile details')}</h2>
              <p className="profile-description">{__('View your identity, profile history, and recovery status.')}</p>
              <dl>
                <div><dt>{__('Username')}</dt><dd>{username}</dd></div>
                <div><dt>{__('User created')}</dt><dd><UserCreationDate key={genesis} genesis={genesis} /></dd></div>
                <div><dt>{__('Recovery phrase')}</dt><dd><RecoveryStatus genesis={genesis} compact /></dd></div>
                {genesis && <div className="identity-row"><dt>{__('User ID')}</dt><dd className="user-id"><span className="user-id-value">{genesis}</span><Tooltip.Trigger tooltip={__('Copy user ID')}><Button skin="primary" square={30} type="button" aria-label={__('Copy user ID')} onClick={() => { clipboard.writeText(genesis); showNotification(__('User ID copied to clipboard'), 'success'); }}><Icon icon={copyIcon} /></Button></Tooltip.Trigger></dd></div>}
              </dl>
            </section>
          </div>
        </RequireLoggedIn>
      </PageBody>
    </UserPageSurface>) : (<Panel
      icon={userIcon}
      title={__('User')}
      controls={loggedIn ? <UserOptions /> : undefined}
    >
      <RequireLoggedIn>
        {loggedIn && <div className="mb1"><strong>{username}</strong>{genesis && <div style={{ overflowWrap: 'anywhere' }}>{__('User ID')}: {genesis}</div>}</div>}
        {loggedIn && <div className="mb1"><ProfileDetails key={genesis} genesis={genesis} /></div>}
      </RequireLoggedIn>
    </Panel>)
  );
}
