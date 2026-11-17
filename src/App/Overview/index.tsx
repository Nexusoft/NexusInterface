// External
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal
import { webGLAvailable } from 'consts/misc';
import UT from 'lib/usageTracking';
import { settingsAtom } from 'lib/settings';
import { themeAtom } from 'lib/theme';
import { useCoreInfo } from 'lib/coreInfo';
import Globe from './Globe';
import Stats from './Stats';

__ = __context('Overview');

const OverviewPage = styled.div({
  width: '100%',
  position: 'relative',
});

export default function Overview() {
  const settings = useAtomValue(settingsAtom);
  const theme = useAtomValue(themeAtom);
  const coreInfo = useCoreInfo();
  const blocks = coreInfo?.blocks;
  const showingGlobe =
    settings.acceptedAgreement && settings.renderGlobe && webGLAvailable;

  useEffect(() => {
    UT.SendScreen('Overview');
  }, []);
  if (settings.overviewDisplay === 'none') {
    return <OverviewPage />;
  }

  return (
    <OverviewPage>
      {!!showingGlobe && (
        <Globe
          coreAvailable={!!coreInfo}
          blocks={blocks}
          pillarColor={theme.globePillarColor}
          archColor={theme.globeArchColor}
          globeColor={theme.globeColor}
          lispPillarColor="#00ffff"
        />
      )}

      <Stats showingGlobe={showingGlobe} />
    </OverviewPage>
  );
}
