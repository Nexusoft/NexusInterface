// External
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as TYPE from 'actions/actiontypes';
import { remote } from 'electron';
import Text from 'components/Text';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import googleanalytics from 'scripts/googleanalytics';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ContextMenuBuilder from 'contextmenu';
import * as helpers from 'scripts/helper.js';
import { timing, consts } from 'styles';
import NetworkGlobe from './NetworkGlobe';

// Images
import usdIcon from 'images/USD.sprite.svg';
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
import maxmindLogo from 'images/maxmind-header-logo-compact.svg';

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
];

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common,
    ...state.settings,
    ...state.intl,
  };
};
const mapDispatchToProps = dispatch => ({
  setExperimentalWarning: save =>
    dispatch({ type: TYPE.SET_EXPERIMENTAL_WARNING, payload: save }),
  BlockDate: stamp => dispatch({ type: TYPE.BLOCK_DATE, payload: stamp }),
  acceptMITAgreement: () => dispatch({ type: TYPE.ACCEPT_MIT }),
  toggleSave: () => dispatch({ type: TYPE.TOGGLE_SAVE_SETTINGS_FLAG }),
  ignoreEncryptionWarning: () =>
    dispatch({ type: TYPE.IGNORE_ENCRYPTION_WARNING }),
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
  },
  ({ left, compact }) =>
    left && {
      textAlign: 'right',
      right: compact ? 'calc(56% + 80px)' : 'calc(70% + 120px)',
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
      left: compact ? 'calc(56% + 80px)' : 'calc(70% + 120px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideLeft}`,
      [Stat]: {
        justifyContent: 'flex-start',
      },
      [StatIcon]: {
        marginRight: 15,
      },
    }
);

const Stat = styled.div(
  ({ theme }) => ({
    display: 'block',
    margin: '1.7em 0',
    display: 'flex',
    alignItems: 'center',
    filter: `drop-shadow(0 0 5px #000)`,
    color: theme.light,
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

class Overview extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);

    googleanalytics.SendScreen('Overview');
  }
  reDrawEverything() {}
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // React Method (Life cycle hook)
  componentDidUpdate(prevProps) {
    const { blocks, webGLEnabled, settings, connections } = this.props;

    if (settings.acceptedagreement && webGLEnabled && settings.renderGlobe) {
      if (blocks != prevProps.blocks && blocks && prevProps.blocks) {
        this.redrawCurves();
      }

      if (prevProps.connections && !connections) {
        this.removeAllPoints();
        this.reDrawEverything();
        return;
      }

      if (connections && prevProps.connections !== connections) {
        //Daemon Starting Up
        this.reDrawEverything();
      }
    }
  }

  // Class methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;

    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  blockDate() {
    if (!this.props.blockDate) {
      return <Text id="ToolTip.GettingNextBlock" />;
    } else {
      return this.props.blockDate.toLocaleString(this.props.settings.locale);
    }
  }

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

  trustIcon() {
    const tw = Math.round((this.props.trustweight || 0) / 10);
    return trustIcons[tw];
  }

  blockWeightIcon() {
    const bw = Math.round((this.props.blockweight || 0) / 10);
    return blockWeightIcons[bw];
  }

  showingGlobe() {
    return (
      this.props.settings.acceptedagreement &&
      this.props.settings.renderGlobe &&
      this.props.webGLEnabled
    );
  }

  numberWithCommas(x) {
    if (x) return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  calculateUSDvalue() {
    if (this.props.rawNXSvalues[0]) {
      let selectedCurrancyValue = this.props.rawNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });

      let currencyValue = this.props.balance * selectedCurrancyValue[0].price;
      if (currencyValue === 0) {
        currencyValue = `${currencyValue}.00`;
      } else {
        currencyValue = currencyValue.toFixed(2);
      }
      return `${helpers.ReturnCurrencySymbol(
        selectedCurrancyValue[0].name,
        this.props.displayNXSvalues
      ) + currencyValue}`;
    } else {
      return '$0';
    }
  }

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

  waitForDaemon = stat =>
    this.props.connections !== undefined ? (
      stat
    ) : (
      <span className="dim">-</span>
    );

  // Mandatory React method
  render() {
    const { connections, balance, stake, displayNXSvalues } = this.props;
    return (
      <OverviewPage>
        {!!this.showingGlobe() && (
          <>
            <NetworkGlobe
              handleOnLineRender={e => (this.redrawCurves = e)}
              // handleOnRemoveOldPoints={e => (this.removeOldPoints = e)} // causes issues
              handleOnAddData={e => (this.reDrawEverything = e)}
              handleRemoveAllPoints={e => (this.removeAllPoints = e)}
              pillarColor={
                this.props.theme.globePillarColor
              }
              archColor={this.props.theme.globeArchColor}
              globeColor={this.props.theme.globeColor}
            />
            <MaxmindCopyright>
              <MaxmindLogo src={maxmindLogo} />
              Globe includes GeoLite2
            </MaxmindCopyright>
          </>
        )}

        <Stats left compact={!this.showingGlobe()}>
          <Stat
            as={connections ? Link : undefined}
            to={connections ? '/Transactions' : undefined}
          >
            <div>
              <StatLabel>
                {stake > 0 ? (
                  <span>Balance and Stake</span>
                ) : (
                  <Text id="overview.Balance" />
                )}{' '}
                (NXS)
              </StatLabel>
              <StatValue>
                {this.waitForDaemon(balance + (stake || 0))}
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
                <Text id="overview.Balance" /> (
                {this.props.settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {this.waitForDaemon(this.calculateUSDvalue())}
              </StatValue>
            </div>
            <StatIcon icon={usdIcon} />
          </Stat>

          <Stat
            as={connections ? Link : undefined}
            to={connections ? '/Transactions' : undefined}
          >
            <div>
              <StatLabel>
                <Text id="overview.Transactions" />
              </StatLabel>
              <StatValue>{this.waitForDaemon(this.props.txtotal)}</StatValue>
            </div>
            <StatIcon icon={transactionIcon} />
          </Stat>

          <Stat
            as={displayNXSvalues[0] ? Link : undefined}
            to={displayNXSvalues[0] ? '/Market' : undefined}
          >
            <div>
              <StatLabel>
                <Text id="overview.MarketPrice" /> (
                {this.props.settings.fiatCurrency})
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
                <Text id="overview.MarketCap" /> (
                {this.props.settings.fiatCurrency})
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
                <Text id="overview.24hrChange" /> (
                {this.props.settings.fiatCurrency} %)
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
                <Text id="overview.Connections" />
              </StatLabel>
              <StatValue>
                {this.waitForDaemon(this.props.connections)}
              </StatValue>
            </div>
          </Stat>

          <Stat>
            <StatIcon icon={interestIcon} />
            <div>
              <StatLabel>
                <Text id="overview.InterestRate" />
              </StatLabel>
              <StatValue>
                {this.waitForDaemon(this.props.interestweight + '%')}
              </StatValue>
            </div>
          </Stat>

          <Tooltip.Trigger position="left" tooltip={this.blockDate()}>
            <Stat className="relative">
              <StatIcon icon={nxsblocksIcon} />
              <div>
                <StatLabel>
                  <Text id="overview.BlockCount" />
                </StatLabel>

                <StatValue>
                  {this.waitForDaemon(this.numberWithCommas(this.props.blocks))}
                </StatValue>
              </div>
            </Stat>
          </Tooltip.Trigger>

          <Stat>
            <StatIcon icon={this.blockWeightIcon()} />
            <div>
              <StatLabel>
                <Text id="overview.BlockWeightt" />
              </StatLabel>
              <StatValue>
                {this.waitForDaemon(this.props.blockweight)}
              </StatValue>
            </div>
          </Stat>

          <Stat>
            <StatIcon icon={this.trustIcon()} />
            <div>
              <StatLabel>
                <Text id="overview.TrustWeight" />
              </StatLabel>
              <StatValue>
                {this.waitForDaemon(this.props.trustweight)}
              </StatValue>
            </div>
          </Stat>

          <Stat>
            <StatIcon icon={stakeIcon} />
            <div>
              <StatLabel>
                <Text id="overview.StakeWeight" />
              </StatLabel>
              <StatValue>
                {this.waitForDaemon(this.props.stakeweight)}
              </StatValue>
            </div>
          </Stat>
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
