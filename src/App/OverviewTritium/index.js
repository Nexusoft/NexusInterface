// External
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import GA from 'lib/googleAnalytics';

// Internal
import { refreshBalances, loadAccounts } from 'lib/user';
import { getMiningInfo } from 'lib/core';
import { timing, consts } from 'styles';
import { observeStore } from 'store';
import Globe from './Globe';
import { webGLAvailable } from 'consts/misc';

import {
  NXSBalanceStat,
  NXSFiatBalanceStat,
  FeaturedTokenBalanceStat,
  IncomingBalanceStat,
} from './BalanceStats';
import { PriceStat, MarketCapStat, PctChangeStat } from './MarketStats';
import { ConnectionsStat, BlockCountStat } from './CoreStats';
import {
  StakeRateStat,
  BlockWeightStat,
  TrustWeightStat,
  StakeWeightStat,
} from './StakingStats';
import { PrimeDiffStat, HashDiffStat, StakingDiffStat } from './MiningStats';
import { StatWrapper, StatIcon } from './Stat';

__ = __context('Overview');

const OverviewPage = styled.div({
  width: '100%',
  position: 'relative',
});

const slideRight = keyframes`
  0% {
    opacity: 0;
    transform: translate(-100px,-50%);
  }
  100% {
    opacity: 1;
    transform: translate(0,-50%);
  }
`;

const slideLeft = keyframes`
  0% {
    opacity: 0;
    transform: translate(100px,-50%);
  }
  100% {
    opacity: 1;
    transform: translate(0,-50%);
  }
`;

const Stats = styled.div(
  {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap',
    // I don't like this but its a quick fix for super small screens.
    '@media (min-height: 10px) and (max-height: 720px)': {
      fontSize: '75%',
      '& svg': {
        transform: 'scale(0.75)',
      },
    },
  },
  ({ left, compact }) =>
    left && {
      textAlign: 'right',
      right: compact ? 'calc(56% + 40px)' : 'calc(70% + 40px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideRight}`,
      [StatWrapper]: {
        gridTemplateAreas: '"content icon"',
        justifyContent: 'end',
      },
    },
  ({ right, compact }) =>
    right && {
      textAlign: 'left',
      left: compact ? 'calc(56% + 40px)' : 'calc(70% + 40px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideLeft}`,
      [StatWrapper]: {
        gridTemplateAreas: '"icon content"',
        justifyContent: 'start',
      },
    }
);

function useGetBalances() {
  useEffect(() => {
    const unobserve = observeStore(
      ({ user }) => user && user.status,
      (status) => {
        status && refreshBalances();
      }
    );
    return unobserve;
  }, []);
}

function useGetDifficulty(overviewDisplay) {
  useEffect(() => {
    if (overviewDisplay === 'miner') {
      getMiningInfo();
      const intervalID = setInterval(getMiningInfo, 50000);
      return () => {
        clearInterval(intervalID);
      };
    }
  }, [overviewDisplay]);
}

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

      if (prevConnections && connections === 0) {
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

// Mandatory React-Redux method
export default function Overview() {
  const settings = useSelector((state) => state.settings);
  const theme = useSelector((state) => state.theme);
  const connections = useSelector((state) => state.systemInfo?.connections);
  const blocks = useSelector((state) => state.systemInfo?.blocks);
  const showingGlobe =
    settings.acceptedAgreement && settings.renderGlobe && webGLAvailable;

  useEffect(() => {
    GA.SendScreen('Overview');
    // Load accounts to display token balances if any
    loadAccounts();
  }, []);
  useGetBalances();
  useGetDifficulty(settings.overviewDisplay);
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

      <Stats left compact={!showingGlobe}>
        <NXSBalanceStat />
        {theme.featuredTokenName ? (
          <FeaturedTokenBalanceStat />
        ) : (
          <NXSFiatBalanceStat />
        )}
        <IncomingBalanceStat />
        <PriceStat />
        <MarketCapStat />
        <PctChangeStat />
      </Stats>

      <Stats right compact={!showingGlobe}>
        <ConnectionsStat />
        <BlockCountStat />
        <StakeRateStat />
        {settings.overviewDisplay === 'miner' ? (
          <>
            <PrimeDiffStat />
            <HashDiffStat />
            <StakingDiffStat />
          </>
        ) : (
          <>
            <BlockWeightStat />
            <TrustWeightStat />
            <StakeWeightStat />
          </>
        )}
      </Stats>
    </OverviewPage>
  );
}
