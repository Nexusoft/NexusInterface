// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import { refreshBalances } from 'lib/user';
import { getLedgerInfo } from 'lib/core';
import { observeStore } from 'store';

import {
  NXSFiatBalanceStat,
  FeaturedTokenBalanceStat,
  IncomingBalanceStat,
} from './BalanceStats';
import { PriceStat, MarketCapStat, PctChangeStat } from './MarketStats';
import { BlockCountStat } from './CoreStats';
import {
  StakeRateStat,
  BlockWeightStat,
  TrustWeightStat,
  StakeWeightStat,
} from './StakingStats';
import { PrimeDiffStat, HashDiffStat, StakingDiffStat } from './MiningStats';
import { StatWrapper } from './Stat';
import { fade } from 'utils/color';
import { keyframes } from '@emotion/react';
import { timing } from 'styles';
import { consts } from 'styles';
import { NXSBalanceStat } from './BalanceStats';
import { ConnectionsStat } from './CoreStats';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';
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

__ = __context('Overview');

const OverviewPage = styled.div({
  width: '100%',
  position: 'relative',
});

const StatsLayout = styled.div(({ hasGlobe }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  flex: '1 0 auto',
  minHeight: 0,
  gridTemplateColumns: hasGlobe ? 'minmax(150px, 0.85fr) minmax(180px, 1.8fr) minmax(150px, 0.85fr)' : 'repeat(2, minmax(0, 1fr))',
  gap: 'clamp(10px, 1.5vw, 20px)',
  pointerEvents: 'none',
  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 },
  '@media (max-width: 600px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
}));

const StatsColumn = styled.div(themeStyles([{
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  whiteSpace: 'nowrap',
  // I don't like this but its a quick fix for super small screens.
  '@media (min-height: 10px) and (max-height: 720px)': {
    fontSize: '75%',
    '& svg': {
      transform: 'scale(0.75)'
    }
  }
}, ({
  left,
  compact
}) => left && {
  textAlign: 'right',
  right: compact ? 'calc(56% + 40px)' : 'calc(70% + 40px)',
  animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideRight}`,
  [StatWrapper]: {
    gridTemplateAreas: '"content icon"',
    justifyContent: 'end'
  }
}, ({
  right,
  compact
}) => right && {
  textAlign: 'left',
  left: compact ? 'calc(56% + 40px)' : 'calc(70% + 40px)',
  animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideLeft}`,
  [StatWrapper]: {
    gridTemplateAreas: '"icon content"',
    justifyContent: 'start'
  }
}], [({
  theme,
  rightSide,
  metricCount = 4
}) => ({
  '--metric-gap': 'clamp(6px, 1.2vh, 12px)',
  minWidth: 0,
  display: 'grid',
  gridTemplateRows: `repeat(${metricCount}, minmax(min-content, calc((100% - 5 * var(--metric-gap)) / 6)))`,
  alignContent: 'center',
  gap: 'var(--metric-gap)',
  [StatWrapper]: {
    gridTemplateAreas: '"content icon"',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    pointerEvents: 'auto',
    ...(!rightSide && {
      gridTemplateAreas: '"icon content"',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      textAlign: 'right',
      paddingLeft: 'clamp(12px, 1.4vw, 20px)',
      paddingRight: 'clamp(12px, 1.4vw, 20px)',
      background: `linear-gradient(90deg, ${fade(theme.primary, 0.6)}, ${fade(theme.primary, 0.94)}) left bottom / 100% 1px no-repeat`,
      borderRight: 0,
      borderLeft: `2px solid ${fade(theme.primary, 0.35)}`,
      '&::before': {
        transform: 'none'
      },
      '&::after': {
        left: 'auto',
        right: -2,
        transform: 'rotate(45deg)'
      }
    })
  }
})]));

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

function useGetLedgerInfo() {
  useEffect(() => {
    let timeoutID;
    const updateLedgerInfo = async () => {
      const result = await getLedgerInfo();
      if (result) {
        // update every 30 seconds
        setTimeout(updateLedgerInfo, 30000);
      } else {
        // if failed, retry every 3 seconds
        setTimeout(updateLedgerInfo, 3000);
      }
    };
    updateLedgerInfo();
    return () => {
      clearInterval(timeoutID);
    };
  }, []);
}

// Mandatory React-Redux method
export default function Stats({ children, showingGlobe }) {
  const { modern } = useTheme();
  const overviewDisplay = useSelector(
    (state) => state.settings.overviewDisplay
  );
  const featuredTokenName = useSelector(
    (state) => state.theme?.featuredTokenName
  );

  useGetBalances();
  useGetLedgerInfo();

  if (overviewDisplay === 'none') {
    return <OverviewPage />;
  }

  return (
    modern ? (<StatsLayout hasGlobe={!!children}>
      <StatsColumn metricCount={5}>
        {featuredTokenName ? (
          <FeaturedTokenBalanceStat />
        ) : (
          <NXSFiatBalanceStat />
        )}
        <IncomingBalanceStat />
        <PriceStat />
        <MarketCapStat />
        <PctChangeStat />
      </StatsColumn>
      {children}
      <StatsColumn rightSide metricCount={5}>
        <BlockCountStat />
        <StakeRateStat />
        {overviewDisplay === 'miner' ? (
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
      </StatsColumn>
    </StatsLayout>) : (<>
      <StatsColumn left compact={!showingGlobe}>
        <NXSBalanceStat />
        {featuredTokenName ? (
          <FeaturedTokenBalanceStat />
        ) : (
          <NXSFiatBalanceStat />
        )}
        <IncomingBalanceStat />
        <PriceStat />
        <MarketCapStat />
        <PctChangeStat />
      </StatsColumn>

      <StatsColumn right compact={!showingGlobe}>
        <ConnectionsStat />
        <BlockCountStat />
        <StakeRateStat />
        {overviewDisplay === 'miner' ? (
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
      </StatsColumn>
    </>)
  );
}
