// External
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import UT from 'lib/usageTracking';

// Internal
import { webGLAvailable } from 'consts/misc';
import Icon from 'components/Icon';
import connectionsIcon from 'icons/Connections16.svg';
import Globe from './Globe';
import Stats from './Stats';
import MapOverview from './MapOverview';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import { NXSBalanceStat } from './BalanceStats';
import { StatWrapper } from './Stat';
import { fade } from 'utils/color';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';
import SyncStatus from '../Header/StatusIconsTritium/SyncStatus';

__ = __context('Overview');

const OverviewPage = styled.div(themeStyles([{
  width: '100%',
  position: 'relative'
}], [({
  theme
}) => ({
  width: '100%',
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  padding: 'clamp(12px, 2.5vh, 28px) clamp(12px, 2vw, 28px)',
  paddingBottom: 12,
  ...modernGridBackground(theme),
  '@media (max-width: 600px)': {
    padding: 12
  }
})]));

const PageHeading = styled.div(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  marginBottom: 0,
  flexShrink: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(150px, 0.85fr) minmax(180px, 1.8fr) minmax(150px, 0.85fr)',
  alignItems: 'start',
  columnGap: 'clamp(10px, 1.5vw, 20px)',
  rowGap: 6,
  [StatWrapper]: { gridColumn: 2, gridRow: 1, alignSelf: 'start' },
  '.network, .sync-status': { display: 'flex', alignItems: 'center', height: 42, boxSizing: 'border-box', gap: 8, border: `1px solid ${fade(theme.primary, 0.7)}`, borderRadius: 24, padding: '8px 14px', fontSize: 11, lineHeight: 1.4, whiteSpace: 'nowrap', color: theme.foreground },
  '.network': { gridColumn: 3, gridRow: 1, justifySelf: 'end' },
  '.sync-status': { gridColumn: 1, gridRow: 1, justifySelf: 'start' },
  '.sync-status:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '.network > svg, .sync-status > svg': { width: 24, height: 24, flexShrink: 0, color: theme.primary },
  '.sync-status > .synchronized-icon': { width: 20, height: 20 },
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    [StatWrapper]: { gridColumn: '1 / -1', gridRow: 1 },
    '.sync-status': { gridColumn: 1, gridRow: 2 },
    '.network': { gridColumn: 2, gridRow: 2 },
  },
  '@media (max-width: 440px)': {
    '.sync-status': { gridColumn: '1 / -1', gridRow: 2 },
    '.network': { gridColumn: '1 / -1', gridRow: 3, justifySelf: 'start' },
  },
}));

const InterfaceVersion = styled.div(({ theme }) => ({
  position: 'relative',
  flexShrink: 0,
  alignSelf: 'flex-end',
  marginTop: 10,
  zIndex: 1,
  fontSize: 10,
  lineHeight: 1.6,
  color: theme.mixer(0.65),
  opacity: 0.5,
  pointerEvents: 'none',
}));

const GlobeStage = styled.section(({ theme }) => ({
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
  pointerEvents: 'auto',
  borderRadius: 24,
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 'calc(var(--globe-diameter, 70%) * 1.15)',
    aspectRatio: '1',
    border: `1px solid ${fade(theme.primary, 0.55)}`,
    borderRadius: '50%',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    background: `radial-gradient(circle, transparent 58%, ${fade(theme.primary, 0.94)} 66%, ${fade(theme.primary, 0.88)} 70%, transparent 72%)`,
    boxShadow: `0 0 48px ${fade(theme.primary, 0.83)}, inset 0 0 36px ${fade(theme.primary, 0.88)}`,
    pointerEvents: 'none',
  },
  '@media (max-width: 900px)': { gridColumn: '1 / -1', gridRow: 1, minHeight: 'clamp(220px, 40vh, 380px)' },
}));

const GlobeCaption = styled.div(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
  paddingBottom: 16,
  textAlign: 'center',
  fontSize: 10,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: theme.mixer(0.65),
  pointerEvents: 'none',
}));

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
  const { modern } = useTheme();
  const settings = useSelector((state) => state.settings);
  const mapLayout = modern && (settings.modernOverviewLayout || 'map') === 'map';
  const theme = useSelector((state) => state.theme);
  const connections = useSelector(
    (state) => state.core.systemInfo?.connections
  );
  const blocks = useSelector((state) => state.core.systemInfo?.blocks);
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
    return <OverviewPage>{modern && <GridTracers />}</OverviewPage>;
  }

  return (
    modern ? (<OverviewPage>
      <GridTracers />
      {!mapLayout && <PageHeading>
        <SyncStatus badge />
        <NXSBalanceStat compact />
        <div className="network">
          <Icon icon={connectionsIcon} aria-hidden="true" />
          <span>{connections ? __('%{count} peers connected', { count: connections }) : __('Waiting for network')}</span>
        </div>
      </PageHeading>}
      {mapLayout ? <MapOverview>{showingGlobe ? <>
        <Globe key="map" modern mapLayout
          mapColor={theme.globeColor}
          mapGlowColor={theme.globeColor}
          handleOnLineRender={(f) => (redrawCurves.current = f)}
          handleRemoveAllPoints={(f) => (removeAllPoints.current = f)}
          connections={connections} blocks={blocks}
          pillarColor={theme.globePillarColor} archColor={theme.globeArchColor}
          globeColor={theme.globeColor} lispPillarColor="#00ffff"
        />
      </> : <GlobeCaption>{__('Peer visualization unavailable or disabled in Style settings.')}</GlobeCaption>}</MapOverview> : <Stats>
      {!!showingGlobe && <GlobeStage data-globe-stage aria-label={__('Global peer network')}>
        <Globe
          modern={theme.modern}
          handleOnLineRender={(f) => (redrawCurves.current = f)}
          handleRemoveAllPoints={(f) => (removeAllPoints.current = f)}
          connections={connections}
          blocks={blocks}
          pillarColor={theme.globePillarColor}
          archColor={theme.globeArchColor}
          globeColor={theme.globeColor}
          lispPillarColor="#00ffff"
        />
      </GlobeStage>}
      </Stats>}
      {!mapLayout && !!showingGlobe && <GlobeCaption>{__('Global peer network')}</GlobeCaption>}
      {!mapLayout && <InterfaceVersion>{__('Interface version')}: {APP_VERSION}</InterfaceVersion>}
    </OverviewPage>) : (<OverviewPage>
      {!!showingGlobe && (
        <Globe
          modern={theme.modern}
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
    </OverviewPage>)
  );
}
