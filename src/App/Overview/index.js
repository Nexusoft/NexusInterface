// External
import { Fragment, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import GA from 'lib/googleAnalytics';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import { getDifficulty } from 'lib/core';
import { updateSettings } from 'lib/settings';
import { formatNumber, formatCurrency, formatRelativeTime } from 'lib/intl';
import { timing, consts } from 'styles';
import { isCoreConnected } from 'selectors';
import Globe from './Globe';
import { webGLAvailable } from 'consts/misc';

// Images
import logoIcon from 'icons/NXS_coin.svg';
import currencyIcons from 'data/currencyIcons';
import transactionIcon from 'icons/transaction.svg';
import chartIcon from 'icons/chart.svg';
import supplyIcon from 'icons/supply.svg';
import hours24Icon from 'icons/24hr.svg';
import nxsStakeIcon from 'icons/nxs-staking.svg';

import Connections0 from 'icons/Connections0.svg';
import Connections4 from 'icons/Connections4.svg';
import Connections8 from 'icons/Connections8.svg';
import Connections12 from 'icons/Connections12.svg';
import Connections14 from 'icons/Connections14.svg';
import Connections16 from 'icons/Connections16.svg';
import blockweight0 from 'icons/BlockWeight-0.svg';
import blockweight1 from 'icons/BlockWeight-1.svg';
import blockweight2 from 'icons/BlockWeight-2.svg';
import blockweight3 from 'icons/BlockWeight-3.svg';
import blockweight4 from 'icons/BlockWeight-4.svg';
import blockweight5 from 'icons/BlockWeight-5.svg';
import blockweight6 from 'icons/BlockWeight-6.svg';
import blockweight7 from 'icons/BlockWeight-7.svg';
import blockweight8 from 'icons/BlockWeight-8.svg';
import blockweight9 from 'icons/BlockWeight-9.svg';
import trust00 from 'icons/trust00.svg';
import trust10 from 'icons/trust00.svg';
import trust20 from 'icons/trust00.svg';
import trust30 from 'icons/trust00.svg';
import trust40 from 'icons/trust00.svg';
import trust50 from 'icons/trust00.svg';
import trust60 from 'icons/trust00.svg';
import trust70 from 'icons/trust00.svg';
import trust80 from 'icons/trust00.svg';
import trust90 from 'icons/trust00.svg';
import trust100 from 'icons/trust00.svg';
import nxsblocksIcon from 'icons/blockexplorer-invert-white.svg';
import interestIcon from 'icons/interest.svg';
import stakeIcon from 'icons/staking-white.svg';
import warningIcon from 'icons/warning.svg';
import questionMarkCircleIcon from 'icons/question-mark-circle.svg';

__ = __context('Overview');

const trustIcons = [
  trust00,
  trust10,
  trust20,
  trust30,
  trust40,
  trust50,
  trust60,
  trust70,
  trust80,
  trust90,
  trust100,
];

const blockWeightIcons = [
  blockweight0,
  blockweight1,
  blockweight2,
  blockweight3,
  blockweight4,
  blockweight5,
  blockweight6,
  blockweight7,
  blockweight8,
  blockweight9,
  blockweight9,
];

/**
 * Formats the Difficulty to 3 decimal points
 * @memberof Overview
 * @param {*} diff
 * @returns {Number} Diff but with 3 decimal point places
 */
const formatDiff = (diff) => (diff || 0).toFixed(3);

// React-Redux mandatory methods
const mapStateToProps = (state) => {};

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
      right: compact ? 'calc(56% + 80px)' : 'calc(70% + 80px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideRight}`,
      [Stat]: {
        justifyContent: 'flex-end',
      },
      [StatIcon]: {
        marginLeft: 15,
      },
    },
  ({ right, compact }) =>
    right && {
      textAlign: 'left',
      left: compact ? 'calc(56% + 80px)' : 'calc(70% + 80px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideLeft}`,
      [Stat]: {
        justifyContent: 'flex-start',
      },
      [StatIcon]: {
        marginRight: 15,
      },
    }
);

const MinimalStats = styled.div({
  fontSize: '45%',
  textAlign: 'center',
  display: 'flex',
  margin: '0 auto',
  marginTop: '-1em',
  animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideRight}`,
  justifyContent: 'center',
});

const Stat = styled.div(
  ({ theme }) => ({
    display: 'block',
    margin: '1.7em 0',
    display: 'flex',
    alignItems: 'center',
    filter: `drop-shadow(0 0 5px #000)`,
    color: theme.foreground,
  }),
  ({ to, theme }) =>
    to && {
      cursor: 'pointer',
      transitionProperty: 'filter',
      transitionDuration: timing.normal,
      transitionTimingFunction: 'ease-out',
      '&:hover': {
        filter: `drop-shadow(0 0 8px ${theme.primary}) brightness(120%)`,
      },
    }
);

const MinimalStat = styled.div(
  ({ theme }) =>
    theme && {
      display: 'flex',
      alignItems: 'center',
      background: 'rgb(0,0,0,0.5)',
      filter: `drop-shadow(0 0 2px ` + theme.primaryAccent + `)`,
      marginLeft: '1.5em',
      [StatValue]: {
        marginLeft: '0.5em',
        height: '50%',
        lineHeight: '50%',
        whiteSpace: 'nowrap',
      },
      [StatLabel]: {
        height: '50%',
        marginTop: '0.50em',
        whiteSpace: 'nowrap',
        lineHeight: '50%',
      },
    }
);

const StatLabel = styled.div(({ theme }) => ({
  fontWeight: 'bold',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  fontSize: '.9em',
  color: theme.primary,
}));

const StatValue = styled.div({
  fontSize: '1.8em',
});

const StatIcon = styled(Icon)(({ theme }) => ({
  width: 38,
  height: 38,
  color: theme.primary,
}));

const MaxmindCopyright = styled.div(({ theme }) => ({
  position: 'fixed',
  left: 6,
  bottom: 3,
  opacity: 0.4,
  color: theme.primary,
  zIndex: 1, // over the navigation bar
}));

const MaxmindLogo = styled.img({
  display: 'block',
  width: 181,
});

const BlockCountTooltip = ({ blockDate }) => (
  <div style={{ textAlign: 'center' }}>
    {__('Last updated\n%{time}', {
      time: blockDate && formatRelativeTime(blockDate),
    })}
  </div>
);

function getConnectionsIcon(conn) {
  if (conn > 4 && conn <= 6) {
    return Connections4;
  } else if (conn > 6 && conn <= 12) {
    return Connections8;
  } else if (conn > 12 && conn <= 14) {
    return Connections12;
  } else if (conn > 14 && conn <= 15) {
    return Connections14;
  } else if (conn > 15) {
    return Connections16;
  } else {
    return Connections0;
  }
}

function getTrustIcon(trustweight) {
  const tw = Math.round((trustweight || 0) / 10);
  return trustIcons[tw];
}

function getBlockWeightIcon(blockweight) {
  const bw = Math.round((blockweight || 0) / 10);
  return blockWeightIcons[bw];
}

function numberWithCommas(x) {
  if (typeof x === 'number')
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function Overview() {
  const coreConnected = useSelector(isCoreConnected);
  const blockDate = useSelector((state) => state.common.blockDate);
  const market = useSelector((state) => state.market);
  const settings = useSelector((state) => state.settings);
  const theme = useSelector((state) => state.theme);
  const coreInfo = useSelector((state) => state.core.info);
  const difficulty = useSelector((state) => state.core.difficulty);

  const {
    connections,
    balance,
    unconfirmedbalance,
    stake,
    newmint,
    txtotal,
    interestweight,
    stakerate,
    blockweight,
    trustweight,
    stakeweight,
    blocks,
    synccomplete,
  } = coreInfo || {};
  const syncUnknown =
    (!synccomplete && synccomplete !== 0) ||
    synccomplete < 0 ||
    synccomplete > 100;
  const synchronizing = !syncUnknown && synccomplete !== 100;
  const { fiatCurrency } = settings;
  const correctView =
    settings.overviewDisplay !== 'minimalist' &&
    settings.overviewDisplay !== 'none';
  const showingGlobe =
    settings.acceptedAgreement && settings.renderGlobe && webGLAvailable;
  const globeReady = showingGlobe && correctView;

  const redrawCurvesRef = useRef(() => {});
  const removeAllPointsRef = useRef(() => {});

  useEffect(() => {
    GA.SendScreen('Overview');
    getDifficulty();
    const timerId = setInterval(getDifficulty, 50000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (globeReady) {
      redrawCurvesRef.current();
    }
  }, [globeReady, blocks]);

  useEffect(() => {
    if (globeReady && connections === 0) {
      removeAllPointsRef.current();
      // this.reDrawEverything();
    }
  }, [globeReady, connections]);

  const waitForCore = (stat) =>
    coreConnected ? stat : <span className="dim">-</span>;

  const weightStats = (
    <Fragment>
      <Stat>
        <StatIcon icon={getBlockWeightIcon(blockweight)} />
        <div>
          <StatLabel>{__('Block Weight')}</StatLabel>
          <StatValue>
            {waitForCore(
              blockweight ? formatNumber(blockweight, 2) + '%' : 'N/A'
            )}
          </StatValue>
        </div>
      </Stat>

      <Stat>
        <StatIcon icon={getTrustIcon(trustweight)} />
        <div>
          <StatLabel>{__('Trust Weight')}</StatLabel>
          <StatValue>
            {waitForCore(
              trustweight ? formatNumber(trustweight, 2) + '%' : 'N/A'
            )}
          </StatValue>
        </div>
      </Stat>

      <Stat>
        <StatIcon icon={stakeIcon} />
        <div>
          <StatLabel>{__('Stake Weight')}</StatLabel>
          <StatValue>
            {waitForCore(
              stakeweight ? formatNumber(stakeweight, 2) + '%' : 'N/A'
            )}
          </StatValue>
        </div>
      </Stat>
    </Fragment>
  );

  const difficultyStats = (
    <Fragment>
      <Stat>
        <StatIcon icon={getTrustIcon(trustweight)} />
        <div>
          <StatLabel>{__('Prime Difficulty')}</StatLabel>
          <StatValue>
            {!!difficulty ? (
              formatNumber(difficulty.prime, 6)
            ) : (
              <span className="dim">-</span>
            )}
          </StatValue>
        </div>
      </Stat>
      <Stat>
        <StatIcon icon={stakeIcon} />
        <div>
          <StatLabel>{__('Hash Difficulty')}</StatLabel>
          <StatValue>
            {!!difficulty ? (
              formatNumber(difficulty.hash, 6)
            ) : (
              <span className="dim">-</span>
            )}
          </StatValue>
        </div>
      </Stat>

      <Stat>
        <StatIcon icon={getBlockWeightIcon(blockweight)} />
        <div>
          <StatLabel>{__('Stake Difficulty')}</StatLabel>
          <StatValue>
            {!!difficulty ? (
              formatNumber(difficulty.stake, 6)
            ) : (
              <span className="dim">-</span>
            )}
          </StatValue>
        </div>
      </Stat>
    </Fragment>
  );

  if (settings.overviewDisplay === 'none') {
    return <OverviewPage />;
  }
  if (settings.overviewDisplay === 'minimalist') {
    return (
      <OverviewPage>
        <MinimalStats>
          <MinimalStat>
            <StatLabel>
              {/* {stake > 0 ? (
                  <span>Balance and Stake</span>
                ) : ( */}
              {__('Balance')}
              {/* )} */}
              (NXS) :
            </StatLabel>
            <StatValue>
              {waitForCore(formatNumber(balance + unconfirmedbalance))}
            </StatValue>
          </MinimalStat>
          {/* + (stake || 0) */}
          <MinimalStat>
            <StatLabel>
              {__('Balance')} ({fiatCurrency})
            </StatLabel>
            <StatValue>
              {market && market.price ? (
                waitForCore(
                  formatCurrency(
                    (balance + unconfirmedbalance) * market.price,
                    fiatCurrency
                  )
                )
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </MinimalStat>

          <MinimalStat>
            <StatLabel>{__('Transactions')}</StatLabel>
            <StatValue>{waitForCore(txtotal)}</StatValue>
          </MinimalStat>

          <MinimalStat>
            <StatLabel>
              {__('Market Price')} ({fiatCurrency})
            </StatLabel>
            <StatValue>
              {market && market.price ? (
                <>
                  {fiatCurrency === 'BTC'
                    ? formatCurrency(market.price, fiatCurrency, 8)
                    : fiatCurrency !== 'BTC'
                    ? formatCurrency(market.price, fiatCurrency, 2)
                    : ''}
                </>
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </MinimalStat>

          <MinimalStat>
            <StatLabel>
              {__('24hr Change')} ({fiatCurrency} %)
            </StatLabel>
            <StatValue>
              {market && typeof market.changePct24Hr === 'number' ? (
                <>
                  {market.changePct24Hr > 0
                    ? '+ '
                    : market.changePct24Hr < 0
                    ? '- '
                    : ''}
                  {formatNumber(market.changePct24Hr, 2) + '%'}
                </>
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </MinimalStat>
          <MinimalStat>
            <StatLabel>{__('Connections')}</StatLabel>
            <StatValue>{waitForCore(connections)}</StatValue>
          </MinimalStat>

          <MinimalStat>
            <StatLabel>{__('Stake Rate')}</StatLabel>
            <StatValue>
              {waitForCore(formatNumber(interestweight || stakerate, 2) + '%')}
            </StatValue>
          </MinimalStat>

          <MinimalStat className="relative">
            <StatLabel>{__('Block Count')}</StatLabel>

            <StatValue>{waitForCore(numberWithCommas(blocks))}</StatValue>
          </MinimalStat>
        </MinimalStats>
      </OverviewPage>
    );
  }

  return (
    <OverviewPage>
      {!!showingGlobe && (
        <Globe
          handleOnLineRender={(e) => (redrawCurvesRef.current = e)}
          handleRemoveAllPoints={(e) => (removeAllPointsRef.current = e)}
          connections={connections}
          pillarColor={theme.globePillarColor}
          archColor={theme.globeArchColor}
          globeColor={theme.globeColor}
          lispPillarColor="#00ffff"
        />
      )}

      <Stats left compact={!showingGlobe}>
        <Stat
          onClick={() => {
            updateSettings({
              displayFiatBalance: !settings.displayFiatBalance,
            });
          }}
          to={coreConnected ? 'HackToGetProperStyling' : undefined}
        >
          <div>
            <StatLabel>
              {!!synchronizing && (
                <Tooltip.Trigger
                  align="start"
                  tooltip={__(
                    'The balance displayed might not be up-to-date since the wallet is not yet fully synchronized'
                  )}
                >
                  <Icon icon={warningIcon} className="mr0_4" />
                </Tooltip.Trigger>
              )}{' '}
              <span className="v-align">
                {__('Balance')} (
                {settings.displayFiatBalance ? fiatCurrency : 'NXS'})
              </span>
            </StatLabel>
            <StatValue>
              {settings.hideOverviewBalances ? (
                '-'
              ) : !settings.displayFiatBalance ? (
                waitForCore(formatNumber(balance + unconfirmedbalance))
              ) : market && market.price ? (
                waitForCore(
                  formatCurrency(
                    (balance + unconfirmedbalance) * market.price,
                    fiatCurrency
                  )
                )
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </div>
          <StatIcon
            icon={
              settings.displayFiatBalance
                ? currencyIcons(fiatCurrency)
                : logoIcon
            }
          />
        </Stat>
        <Stat
          as={coreConnected ? Link : undefined}
          to={coreConnected ? '/Transactions' : undefined}
        >
          <div>
            <StatLabel>
              <Tooltip.Trigger
                tooltip={__(
                  'Staking and mining rewards that need to get past 120 block-old to become available'
                )}
                align="start"
              >
                <Icon icon={questionMarkCircleIcon} />
              </Tooltip.Trigger>{' '}
              <span className="v-align">{__('Immature Balance')} (NXS)</span>
            </StatLabel>
            <StatValue>
              {settings.hideOverviewBalances
                ? '-'
                : waitForCore(formatNumber(stake + newmint))}
            </StatValue>
          </div>
          <StatIcon icon={nxsStakeIcon} />
        </Stat>
        <Stat
          as={coreConnected ? Link : undefined}
          to={coreConnected ? '/Transactions' : undefined}
        >
          <div>
            <StatLabel>{__('Transactions')}</StatLabel>
            <StatValue>{waitForCore(txtotal)}</StatValue>
          </div>
          <StatIcon icon={transactionIcon} />
        </Stat>
        <Stat>
          <div>
            <StatLabel>
              {__('Market Price')} ({fiatCurrency})
            </StatLabel>
            <StatValue>
              {market && market.price ? (
                <>
                  {fiatCurrency === 'BTC'
                    ? formatCurrency(market.price, fiatCurrency, 8)
                    : fiatCurrency !== 'BTC'
                    ? formatCurrency(market.price, fiatCurrency, 2)
                    : ''}
                </>
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </div>
          <StatIcon icon={chartIcon} />
        </Stat>
        <Stat>
          <div>
            <StatLabel>
              {__('Market Cap')} ({fiatCurrency})
            </StatLabel>
            <StatValue>
              {market?.displayMarketCap ? (
                fiatCurrency === 'BTC' ? (
                  formatCurrency(market.marketCap, fiatCurrency, 2)
                ) : fiatCurrency !== 'BTC' ? (
                  formatCurrency(market.marketCap, fiatCurrency, 0)
                ) : (
                  ''
                )
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </div>
          <StatIcon icon={supplyIcon} />
        </Stat>
        <Stat>
          <div>
            <StatLabel>
              {__('24hr Change')} ({fiatCurrency} %)
            </StatLabel>
            <StatValue>
              {market && typeof market.changePct24Hr === 'number' ? (
                <>
                  {market.changePct24Hr > 0 && '+'}
                  {formatNumber(market.changePct24Hr, 2)}%
                </>
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </div>
          <StatIcon icon={hours24Icon} />
        </Stat>
      </Stats>

      <Stats right compact={!showingGlobe}>
        <Stat>
          <StatIcon icon={getConnectionsIcon(connections)} />
          <div>
            <StatLabel>{__('Connections')}</StatLabel>
            <StatValue>{waitForCore(connections)}</StatValue>
          </div>
        </Stat>

        <Tooltip.Trigger
          position="left"
          tooltip={!!blockDate && <BlockCountTooltip blockDate={blockDate} />}
        >
          <Stat className="relative">
            <StatIcon icon={nxsblocksIcon} />
            <div>
              <StatLabel>{__('Block Count')}</StatLabel>

              <StatValue>{waitForCore(numberWithCommas(blocks))}</StatValue>
            </div>
          </Stat>
        </Tooltip.Trigger>

        <Stat>
          <StatIcon icon={interestIcon} />
          <div>
            <StatLabel>{__('Stake Rate')}</StatLabel>
            <StatValue>
              {waitForCore(
                interestweight || stakerate
                  ? formatNumber(interestweight || stakerate, 2) + '%'
                  : 'N/A'
              )}
            </StatValue>
          </div>
        </Stat>

        {settings.overviewDisplay === 'miner' ? difficultyStats : weightStats}
      </Stats>
    </OverviewPage>
  );
}
