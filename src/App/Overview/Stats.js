// External
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Internal
import { timing, consts } from 'styles';
import { settingsAtom } from 'lib/settings';
import { themeAtom } from 'lib/theme';
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
import { StatWrapper } from './Stat';

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

const StatsColumn = styled.div(
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

export default function Stats({ showingGlobe }) {
  const { overviewDisplay } = useAtomValue(settingsAtom);
  const featuredTokenName = useAtomValue(themeAtom)?.featuredTokenName;

  if (overviewDisplay === 'none') {
    return <OverviewPage />;
  }

  return (
    <>
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
    </>
  );
}
