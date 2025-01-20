// External
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { Routes, Route, Navigate } from 'react-router';
import styled from '@emotion/styled';
import UT from 'lib/usageTracking';

// Internal Global
import Panel from 'components/Panel';
import RouterHorizontalTab from 'components/RouterHorizontalTab';
import { moduleUpdateCountAtom } from 'lib/modules';

// Internal Local
import { lastActiveTabAtom } from './atoms';
import SettingsApp from './App';
import SettingsCore from './Core';
import SettingsStyle from './Style';
import SettingsModules from './Modules';

// Images
import settingsIcon from 'icons/settings.svg';
import coreIcon from 'icons/core.svg';
import logoIcon from 'icons/logo.svg';
import leafIcon from 'icons/leaf.svg';
import legoIcon from 'icons/lego-block.svg';

__ = __context('Settings');

const SettingsComponent = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"tab-bar" "content"',
  gridTemplateRows: 'min-content 1fr',
  position: 'relative',
});

const SettingsTabBar = styled(RouterHorizontalTab.TabBar)({
  gridArea: 'tab-bar',
});

const SettingsContent = styled.div({
  gridArea: 'content',
  overflow: 'auto',
  margin: '0 -30px',
  padding: '0 30px',
});

const SettingsContainer = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

const Badge = styled.div(({ theme }) => ({
  background: theme.primary,
  color: theme.primaryAccent,
  fontSize: '0.8em',
  height: '1.4em',
  width: '1.4em',
  lineHeight: '1em',
  borderRadius: '50%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  verticalAlign: 'middle',
}));

function SettingsRedirect() {
  const lastActiveTab = useAtomValue(lastActiveTabAtom);
  return <Navigate to={lastActiveTab} replace />;
}

/**
 * Settings Page
 *
 * @export
 * @class Settings
 * @extends {Component}
 */
export default function Settings() {
  useEffect(() => {
    UT.SendScreen('Settings');
  }, []);
  const updateCount = useAtomValue(moduleUpdateCountAtom);

  return (
    <Panel bodyScrollable={false} icon={settingsIcon} title={__('Settings')}>
      <SettingsComponent>
        <SettingsTabBar>
          <RouterHorizontalTab
            link="App"
            icon={logoIcon}
            text={__('Application')}
          />
          <RouterHorizontalTab link="Core" icon={coreIcon} text={__('Core')} />
          <RouterHorizontalTab
            link="Style"
            icon={leafIcon}
            text={__('Style')}
          />
          <RouterHorizontalTab
            link="Modules"
            icon={legoIcon}
            text={
              <>
                <span className="v-align">{__('Modules')}</span>
                {!!updateCount && (
                  <Badge className="ml0_4">{updateCount}</Badge>
                )}
              </>
            }
          />
        </SettingsTabBar>

        <SettingsContent>
          <SettingsContainer>
            <Routes>
              <Route path="App" element={<SettingsApp />} />
              <Route path="Core" element={<SettingsCore />} />
              <Route path="Style" element={<SettingsStyle />} />
              <Route path="Modules" element={<SettingsModules />} />
              <Route path="*" element={<SettingsRedirect />} />
            </Routes>
          </SettingsContainer>
        </SettingsContent>
      </SettingsComponent>
    </Panel>
  );
}
