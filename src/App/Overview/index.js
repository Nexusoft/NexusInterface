// External
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import { webGLAvailable } from 'consts/misc';
import UT from 'lib/usageTracking';
import { useCoreInfo } from 'lib/coreInfo';
import Globe from './Globe';
import Stats from './Stats';

__ = __context('Overview');

const OverviewPage = styled.div({
  width: '100%',
  position: 'relative',
});

function usePrevious(value) {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function useUpdateGlobe({ settings, connections, blocks }) {
  const prevConnections = usePrevious(connections);
  const prevBlocks = usePrevious(blocks);
  const redrawCurves = useRef(() => {});
  const removeAllPoints = useRef(() => {});
  useEffect(() => {
    const correctView = settings.overviewDisplay !== 'none';
    if (
      correctView &&
      webGLAvailable &&
      settings.acceptedAgreement &&
      settings.renderGlobe
    ) {
      if (blocks != prevBlocks && blocks && prevBlocks) {
        redrawCurves.current();
      }

      if (prevConnections && connections === undefined) {
        removeAllPoints.current();
        // reDrawEverything.current();
        return;
      }

      if (connections && prevConnections !== connections) {
        //Core Starting Up
        // reDrawEverything.current();
      }
    }
  }, [settings, connections, blocks]);

  return { redrawCurves, removeAllPoints };
}

export default function Overview() {
  const settings = useSelector((state) => state.settings);
  const theme = useSelector((state) => state.theme);
  const coreInfo = useCoreInfo();
  const connections = coreInfo?.connections;
  const blocks = coreInfo?.blocks;
  const showingGlobe =
    settings.acceptedAgreement && settings.renderGlobe && webGLAvailable;

  useEffect(() => {
    UT.SendScreen('Overview');
  }, []);
  const { redrawCurves, removeAllPoints } = useUpdateGlobe({
    settings,
    connections,
    blocks,
  });

  if (settings.overviewDisplay === 'none') {
    return <OverviewPage />;
  }

  return (
    <OverviewPage>
      {!!showingGlobe && (
        <Globe
          handleOnLineRender={(f) => (redrawCurves.current = f)}
          handleRemoveAllPoints={(f) => (removeAllPoints.current = f)}
          connections={connections}
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
