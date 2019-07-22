// External
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as TYPE from 'consts/actionTypes';
import { remote } from 'electron';
import Text from 'components/Text';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import googleanalytics from 'scripts/googleanalytics';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ContextMenuBuilder from 'contextmenu';
import { getDifficulty } from 'actions/core';
import * as helpers from 'scripts/helper.js';
import { updateSettings } from 'actions/settings';
import { timing, consts, animations } from 'styles';
import Globe from './Globe';
import { webGLAvailable } from 'consts/misc';

// Images
import logoIcon from 'images/NXS_coin.sprite.svg';
import { CurrencyIcon } from 'images/CurrencyIcons';
import transactionIcon from 'images/transaction.sprite.svg';
import chartIcon from 'images/chart.sprite.svg';
import supplyIcon from 'images/supply.sprite.svg';
import hours24Icon from 'images/24hr.sprite.svg';
import nxsStakeIcon from 'images/nxs-staking.sprite.svg';

import Connections0 from 'images/Connections0.sprite.svg';
import Connections4 from 'images/Connections4.sprite.svg';
import Connections8 from 'images/Connections8.sprite.svg';
import Connections12 from 'images/Connections12.sprite.svg';
import Connections14 from 'images/Connections14.sprite.svg';
import Connections16 from 'images/Connections16.sprite.svg';
import blockweight0 from 'images/BlockWeight-0.sprite.svg';
import blockweight1 from 'images/BlockWeight-1.sprite.svg';
import blockweight2 from 'images/BlockWeight-2.sprite.svg';
import blockweight3 from 'images/BlockWeight-3.sprite.svg';
import blockweight4 from 'images/BlockWeight-4.sprite.svg';
import blockweight5 from 'images/BlockWeight-5.sprite.svg';
import blockweight6 from 'images/BlockWeight-6.sprite.svg';
import blockweight7 from 'images/BlockWeight-7.sprite.svg';
import blockweight8 from 'images/BlockWeight-8.sprite.svg';
import blockweight9 from 'images/BlockWeight-9.sprite.svg';
import trust00 from 'images/trust00.sprite.svg';
import trust10 from 'images/trust00.sprite.svg';
import trust20 from 'images/trust00.sprite.svg';
import trust30 from 'images/trust00.sprite.svg';
import trust40 from 'images/trust00.sprite.svg';
import trust50 from 'images/trust00.sprite.svg';
import trust60 from 'images/trust00.sprite.svg';
import trust70 from 'images/trust00.sprite.svg';
import trust80 from 'images/trust00.sprite.svg';
import trust90 from 'images/trust00.sprite.svg';
import trust100 from 'images/trust00.sprite.svg';
import nxsblocksIcon from 'images/blockexplorer-invert-white.sprite.svg';
import interestIcon from 'images/interest.sprite.svg';
import stakeIcon from 'images/staking-white.sprite.svg';
import warningIcon from 'images/warning.sprite.svg';

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
const formatDiff = diff => (diff || 0).toFixed(3);

// React-Redux mandatory methods
const mapStateToProps = ({
  core: { info, difficulty },
  common: { blockDate, rawNXSvalues, displayNXSvalues, highestPeerBlock },
  settings,
  theme,
}) => {
  const { synccomplete, blocks } = info;
  const syncUnknown =
    ((!synccomplete && synccomplete !== 0) ||
      synccomplete < 0 ||
      synccomplete > 100) &&
    !highestPeerBlock;
  return {
    difficulty,
    blockDate,
    rawNXSvalues,
    displayNXSvalues,
    settings,
    theme,
    coreInfo: info,
    synchronizing:
      !syncUnknown && (synccomplete !== 100 || highestPeerBlock > blocks),
  };
};
const mapDispatchToProps = dispatch => ({
  BlockDate: stamp => dispatch({ type: TYPE.BLOCK_DATE, payload: stamp }),
  getDifficulty: () => dispatch(getDifficulty()),
  updateSettings: updates => dispatch(updateSettings(updates)),
});

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

/**
 * Overview Page, The main page
 *
 * @class Overview
 * @extends {Component}
 */
class Overview extends Component {
  /**
   *Creates an instance of Overview.
   * @param {*} props
   * @memberof Overview
   */
  constructor(props) {
    super(props);
    this.fetchDifficulty();
  }

  /**
   * Component Mount Callback
   *
   * @memberof Overview
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    googleanalytics.SendScreen('Overview');
  }
  /**
   * Set by {NetworkGlobe}, ReDraws all Pillars and Archs
   *
   * @memberof Overview
   */
  reDrawEverything() {}

  /**
   * Component Unmount Callback
   *
   * @memberof Overview
   */
  componentWillUnmount() {
    clearTimeout(this.diffFetcher);
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Component Prop Update Callback
   *
   * @param {*} prevProps
   * @returns
   * @memberof Overview
   */
  componentDidUpdate(prevProps) {
    const {
      settings,
      coreInfo: { blocks, connections },
    } = this.props;
    const correctView =
      settings.overviewDisplay !== 'minimalist' &&
      settings.overviewDisplay !== 'none';
    if (
      settings.acceptedAgreement &&
      webGLAvailable &&
      settings.renderGlobe &&
      correctView
    ) {
      if (blocks != prevProps.blocks && blocks && prevProps.blocks) {
        this.redrawCurves();
      }

      if (prevProps.connections && connections == 0) {
        this.removeAllPoints();
        this.reDrawEverything();
        return;
      }

      if (connections && prevProps.connections !== connections) {
        //Core Starting Up
        this.reDrawEverything();
      }
    }
  }

  /**
   * Get the Difficulty from the network
   *
   * @memberof Overview
   */
  fetchDifficulty = async () => {
    await this.props.getDifficulty();
    this.diffFetcher = setTimeout(this.fetchDifficulty, 50000);
  };

  // Class methods
  /**
   * Sets up the context menu
   *
   * @param {*} e
   * @memberof Overview
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;

    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * Returns the Block Date of the last given block
   *
   * @returns
   * @memberof Overview
   */
  blockDate() {
    if (!this.props.blockDate) {
      return _('Getting next block...');
    } else {
      return this.props.blockDate.toLocaleString(this.props.settings.locale);
    }
  }

  /**
   * Returns the Connections icon based on how many connections the user has
   *
   * @returns
   * @memberof Overview
   */
  connectionsIcon() {
    const con = this.props.connections;
    if (con > 4 && con <= 6) {
      return Connections4;
    } else if (con > 6 && con <= 12) {
      return Connections8;
    } else if (con > 12 && con <= 14) {
      return Connections12;
    } else if (con > 14 && con <= 15) {
      return Connections14;
    } else if (con > 15) {
      return Connections16;
    } else {
      return Connections0;
    }
  }

  /**
   * Returns the trust icon
   *
   * @returns
   * @memberof Overview
   */
  trustIcon() {
    const tw = Math.round((this.props.coreInfo.trustweight || 0) / 10);
    return trustIcons[tw];
  }

  /**
   * Returns the block weight icon
   *
   * @returns
   * @memberof Overview
   */
  blockWeightIcon() {
    const bw = Math.round((this.props.coreInfo.blockweight || 0) / 10);
    return blockWeightIcons[bw];
  }

  /**
   * Returns if the Globe should be rendered
   *
   * @returns
   * @memberof Overview
   */
  showingGlobe() {
    return (
      this.props.settings.acceptedAgreement &&
      this.props.settings.renderGlobe &&
      webGLAvailable
    );
  }

  /**
   * Add in Commas to a number
   *
   * @param {*} x
   * @returns
   * @memberof Overview
   */
  numberWithCommas(x) {
    if (typeof x === 'number')
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Calculate the value based on the User's Currency
   *
   * @returns
   * @memberof Overview
   */
  calculateFiatvalue() {
    if (this.props.rawNXSvalues[0]) {
      let selectedCurrancyValue = this.props.rawNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      if (selectedCurrancyValue[0] === undefined) {
        selectedCurrancyValue = this.props.rawNXSvalues.filter(ele => {
          if (ele.name === 'USD') {
            return ele;
          }
        });
      }

      let currencyValue =
        this.props.coreInfo.balance * selectedCurrancyValue[0].price;
      if (currencyValue === 0) {
        currencyValue = `${currencyValue}.00`;
      } else {
        currencyValue = currencyValue.toFixed(2);
      }

      return `${helpers.ReturnCurrencySymbol(
        this.props.settings.fiatCurrency
      )} ${currencyValue}`;
    } else {
      return '$0';
    }
  }

  /**
   * Formats the Market Price
   *
   * @returns
   * @memberof Overview
   */
  marketPriceFormatter() {
    if (this.props.displayNXSvalues[0]) {
      let selectedCurrancyValue = this.props.displayNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      return selectedCurrancyValue[0].price;
    } else {
      return '$0';
    }
  }

  /**
   * Formats the Market Cap
   *
   * @returns
   * @memberof Overview
   */
  marketCapFormatter() {
    if (this.props.displayNXSvalues[0]) {
      let selectedCurrancyValue = this.props.displayNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      return selectedCurrancyValue[0].marketCap;
    } else {
      return '$0';
    }
  }

  /**
   * Returns the percentile changed in 24 hrs
   *
   * @returns
   * @memberof Overview
   */
  pctChange24hrFormatter() {
    if (this.props.displayNXSvalues[0]) {
      let selectedCurrancyValue = this.props.displayNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      // return selectedCurrancyValue[0].changePct24Hr;
      if (selectedCurrancyValue[0].changePct24Hr > 0) {
        return `+ ${selectedCurrancyValue[0].changePct24Hr}`;
      } else {
        return selectedCurrancyValue[0].changePct24Hr;
      }
    } else {
      return '0';
    }
  }

  /**
   * Displays Wait for Core
   *
   * @memberof Overview
   */
  waitForCore = stat =>
    this.props.coreInfo.connections !== undefined ? (
      stat
    ) : (
      <span className="dim">-</span>
    );

  /**
   * Returns the weight stats for the overview page
   *
   * @memberof Overview
   */
  returnWeightStats = () => {
    if (Object.keys(this.props.coreInfo).length === 0) {
      return;
    }
    return (
      <React.Fragment>
        <Stat>
          <StatIcon icon={this.blockWeightIcon()} />
          <div>
            <StatLabel>
              _('Block Weight')
            </StatLabel>
            <StatValue>
              {this.waitForCore(this.props.coreInfo.blockweight.toFixed(4))}
            </StatValue>
          </div>
        </Stat>

        <Stat>
          <StatIcon icon={this.trustIcon()} />
          <div>
            <StatLabel>
              _('Trust Weight')
            </StatLabel>
            <StatValue>
              {this.waitForCore(this.props.coreInfo.trustweight.toFixed(4))}
            </StatValue>
          </div>
        </Stat>

        <Stat>
          <StatIcon icon={stakeIcon} />
          <div>
            <StatLabel>
              _('Stake Weight')
            </StatLabel>
            <StatValue>
              {this.waitForCore(this.props.coreInfo.stakeweight.toFixed(4))}
            </StatValue>
          </div>
        </Stat>
      </React.Fragment>
    );
  };

  /**
   * Returns the Difficulty Stats for the Overview page when it is in Miner View
   *
   * @memberof Overview
   */
  returnDifficultyStats = difficulty => {
    console.error(difficulty);
    return (
      <React.Fragment>
        <Stat>
          <StatIcon icon={this.trustIcon()} />
          <div>
            <StatLabel>
              _('Prime Difficulty')
            </StatLabel>
            <StatValue>
              {!!difficulty ? (
                formatDiff(difficulty.prime)
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </div>
        </Stat>
        <Stat>
          <StatIcon icon={stakeIcon} />
          <div>
            <StatLabel>
              _('Hash Difficulty')
            </StatLabel>
            <StatValue>
              {!!difficulty ? (
                formatDiff(difficulty.hash)
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </div>
        </Stat>

        <Stat>
          <StatIcon icon={this.blockWeightIcon()} />
          <div>
            <StatLabel>
              _('Stake Difficulty')
            </StatLabel>
            <StatValue>
              {!!difficulty ? (
                formatDiff(difficulty.stake)
              ) : (
                <span className="dim">-</span>
              )}
            </StatValue>
          </div>
        </Stat>
      </React.Fragment>
    );
  };

  // Mandatory React method
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Overview
   */
  render() {
    const {
      coreInfo: {
        connections,
        balance,
        stake,
        txtotal,
        interestweight,
        stakerate,
        blocks,
      },
      displayNXSvalues,
      difficulty,
      settings,
      theme,
      synchronizing,
    } = this.props;
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
                _('Balance')
                {/* )} */}
                (NXS) :
              </StatLabel>
              <StatValue>{this.waitForCore(balance)}</StatValue>
            </MinimalStat>
            {/* + (stake || 0) */}
            <MinimalStat>
              <StatLabel>
                _('Balance') ({settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {this.waitForCore(this.calculateFiatvalue())}
              </StatValue>
            </MinimalStat>

            <MinimalStat>
              <StatLabel>
                _('Transactions')
              </StatLabel>
              <StatValue>{this.waitForCore(txtotal)}</StatValue>
            </MinimalStat>

            <MinimalStat>
              <StatLabel>
                _('Market Price') ({settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0] ? (
                  this.marketPriceFormatter()
                ) : (
                  <span className="dim">-</span>
                )}
              </StatValue>
            </MinimalStat>

            <MinimalStat>
              <StatLabel>
                _('24hr Change') ({settings.fiatCurrency} %)
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0] ? (
                  this.pctChange24hrFormatter() + '%'
                ) : (
                  <span className="dim">-</span>
                )}
              </StatValue>
            </MinimalStat>
            <MinimalStat>
              <StatLabel>
                _('Connections')
              </StatLabel>
              <StatValue>{this.waitForCore(connections)}</StatValue>
            </MinimalStat>

            <MinimalStat>
              <StatLabel>
                _('Stake Rate')
              </StatLabel>
              <StatValue>
                {this.waitForCore(interestweight || stakerate + '%')}
              </StatValue>
            </MinimalStat>

            <MinimalStat className="relative">
              <StatLabel>
                _('Block Count')
              </StatLabel>

              <StatValue>
                {this.waitForCore(this.numberWithCommas(blocks))}
              </StatValue>
            </MinimalStat>
          </MinimalStats>
        </OverviewPage>
      );
    }

    return (
      <OverviewPage>
        {!!this.showingGlobe() && (
          <Globe
            handleOnLineRender={e => (this.redrawCurves = e)}
            handleRemoveAllPoints={e => (this.removeAllPoints = e)}
            connections={connections}
            pillarColor={theme.globePillarColor}
            archColor={theme.globeArchColor}
            globeColor={theme.globeColor}
            lispPillarColor="#00ffff"
          />
        )}

        <Stats left compact={!this.showingGlobe()}>
          <Stat
            onClick={() => {
              this.props.updateSettings({
                displayFiatBalance: !settings.displayFiatBalance,
              });
            }}
            to={connections ? 'HackToGetProperStyling' : undefined}
          >
            <div>
              <StatLabel>
                {!!synchronizing && (
                  <Tooltip.Trigger
                    align="start"
                    tooltip="The balance displayed might not be up-to-date since the wallet is not yet fully synchronized"
                  >
                    <Icon icon={warningIcon} className="space-right" />
                  </Tooltip.Trigger>
                )}{' '}
                <span className="v-align">
                  _('Balance') {' ('}
                  {settings.displayFiatBalance ? settings.fiatCurrency : 'NXS'}
                  {')'}
                </span>
              </StatLabel>
              <StatValue>
                {settings.overviewDisplay === 'balHidden'
                  ? '-'
                  : settings.displayFiatBalance
                  ? this.waitForCore(this.calculateFiatvalue())
                  : this.waitForCore(balance)}
              </StatValue>
            </div>
            <StatIcon
              icon={
                settings.displayFiatBalance
                  ? CurrencyIcon(this.props.settings.fiatCurrency)
                  : logoIcon
              }
            />
          </Stat>
          <Stat
            as={connections ? Link : undefined}
            to={connections ? '/Transactions' : undefined}
          >
            <div>
              <StatLabel>
                _('Stake Balance') (NXS)
              </StatLabel>
              <StatValue>
                {settings.overviewDisplay === 'balHidden'
                  ? '-'
                  : this.waitForCore(stake)}
              </StatValue>
            </div>
            <StatIcon icon={nxsStakeIcon} />
          </Stat>
          <Stat
            as={connections ? Link : undefined}
            to={connections ? '/Transactions' : undefined}
          >
            <div>
              <StatLabel>
                _('Transactions')
              </StatLabel>
              <StatValue>{this.waitForCore(txtotal)}</StatValue>
            </div>
            <StatIcon icon={transactionIcon} />
          </Stat>
          <Stat
            as={displayNXSvalues[0] ? Link : undefined}
            to={displayNXSvalues[0] ? '/Market' : undefined}
          >
            <div>
              <StatLabel>
                _('Market Price') ({settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0] ? (
                  this.marketPriceFormatter()
                ) : (
                  <span className="dim">-</span>
                )}
              </StatValue>
            </div>
            <StatIcon icon={chartIcon} />
          </Stat>
          <Stat
            as={displayNXSvalues[0] ? Link : undefined}
            to={displayNXSvalues[0] ? '/Market' : undefined}
          >
            <div>
              <StatLabel>
                _('Market Cap') ({settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0] ? (
                  this.marketCapFormatter()
                ) : (
                  <span className="dim">-</span>
                )}
              </StatValue>
            </div>
            <StatIcon icon={supplyIcon} />
          </Stat>
          <Stat
            as={displayNXSvalues[0] ? Link : undefined}
            to={displayNXSvalues[0] ? '/Market' : undefined}
          >
            <div>
              <StatLabel>
                _('24hr Change') ({settings.fiatCurrency} %)
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0] ? (
                  this.pctChange24hrFormatter() + '%'
                ) : (
                  <span className="dim">-</span>
                )}
              </StatValue>
            </div>
            <StatIcon icon={hours24Icon} />
          </Stat>
        </Stats>

        <Stats right compact={!this.showingGlobe()}>
          <Stat>
            <StatIcon icon={this.connectionsIcon()} />
            <div>
              <StatLabel>
                _('Connections')
              </StatLabel>
              <StatValue>{this.waitForCore(connections)}</StatValue>
            </div>
          </Stat>

          <Stat>
            <StatIcon icon={interestIcon} />
            <div>
              <StatLabel>
                _('Stake Rate')
              </StatLabel>
              <StatValue>
                {this.waitForCore(interestweight || stakerate + '%')}
              </StatValue>
            </div>
          </Stat>

          <Tooltip.Trigger position="left" tooltip={this.blockDate()}>
            <Stat className="relative">
              <StatIcon icon={nxsblocksIcon} />
              <div>
                <StatLabel>
                  _('Block Count')
                </StatLabel>

                <StatValue>
                  {this.waitForCore(this.numberWithCommas(blocks))}
                </StatValue>
              </div>
            </Stat>
          </Tooltip.Trigger>

          {settings.overviewDisplay === 'miner'
            ? this.returnDifficultyStats(difficulty)
            : this.returnWeightStats()}
        </Stats>
      </OverviewPage>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview);
