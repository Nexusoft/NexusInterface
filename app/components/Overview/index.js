/*
  Title: Overview
  Description: the landing page for the application.
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Modal from 'react-responsive-modal';
import * as TYPE from 'actions/actiontypes';
import { NavLink } from 'react-router-dom';
import { remote } from 'electron';
import Request from 'request';
import { FormattedMessage } from 'react-intl';
import fs from 'fs';
import path from 'path';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import { intlReducer } from 'react-intl-redux';

// Internal Global Dependencies
import Icon from 'components/common/Icon';
import WEBGL from 'scripts/WebGLCheck.js';
import { GetSettings, SaveSettings } from 'api/settings';
import ContextMenuBuilder from 'contextmenu';
import * as helpers from 'scripts/helper.js';
import configuration from 'api/configuration';
import { colors, timing, consts } from 'styles';

// Internal Local Dependencies
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
  setWebGLEnabled: isEnabled =>
    dispatch({ type: TYPE.SET_WEBGL_ENABLED, payload: isEnabled }),
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
  ({ left }) =>
    left && {
      textAlign: 'right',
      right: 'calc(66% + 120px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideRight}`,
      [Stat]: {
        justifyContent: 'flex-end',
      },
      [StatIcon]: {
        marginLeft: 15,
      },
    },
  ({ right }) =>
    right && {
      textAlign: 'left',
      left: 'calc(66% + 120px)',
      animation: `${timing.slow} ${consts.enhancedEaseOut} 0s ${slideLeft}`,
      [Stat]: {
        justifyContent: 'flex-start',
      },
      [StatIcon]: {
        marginRight: 15,
      },
    }
);

const Stat = styled.div({
  margin: '1.7em 0',
  display: 'flex',
  alignItems: 'center',
  textShadow: `0 0 8px rgba(0,0,0,.7)`,
  color: colors.light,
});

const StatLabel = styled.div({
  fontWeight: 'bold',
  letterSpacing: 1,
  color: colors.primary,
});

const StatValue = styled.div({
  fontSize: '1.8em',
});

const StatIcon = styled(Icon)({
  width: 38,
  height: 38,
  color: colors.primary,
});

const MaxmindCopyright = styled.div({
  position: 'fixed',
  left: 6,
  bottom: 3,
  opacity: 0.4,
  color: colors.primary,
});

const MaxmindLogo = styled.img({
  display: 'block',
  width: 181,
});

class Overview extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    if (WEBGL.isWebGLAvailable()) {
      this.props.setWebGLEnabled(true);
    } else {
      this.props.setWebGLEnabled(false);
      var warning = WEBGL.getWebGLErrorMessage();
      console.error(warning);
    }
    window.addEventListener('contextmenu', this.setupcontextmenu, false);

    if (this.props.googleanalytics != null) {
      this.props.googleanalytics.SendScreen('Overview');
    }
  }
  reDrawEverything() {}
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // React Method (Life cycle hook)
  componentDidUpdate(previousprops) {
    if (this.props.blocks > previousprops.blocks) {
      let newDate = new Date();
      this.props.BlockDate(newDate);
    }

    if (this.props.saveSettingsFlag) {
      SaveSettings(this.props.settings);
    }

    if (this.props.webGLEnabled == false) {
      return;
    }

    if (this.props.blocks != previousprops.blocks) {
      if (this.props.blocks != 0 && previousprops.blocks != 0) {
        this.redrawCurves();
      }
    }

    if (this.props.saveSettingsFlag) {
      SaveSettings(this.props.settings);
    }

    if (
      (this.props.connections == 0 ||
        (this.props.connections == undefined &&
          this.props.percentDownloaded == 0.001)) &&
      this.props.daemonAvailable == false
    ) {
      this.removeAllPoints();
      this.reDrawEverything();
      return;
    }

    if (
      this.props.settings.acceptedagreement !== false ||
      this.props.settings.renderGlobe !== false ||
      this.props.webGLEnabled !== false
    ) {
      if (
        (previousprops.connections == undefined ||
          previousprops.connections == 0) &&
        (this.props.connections != 0 || this.props.connections != undefined) &&
        this.props.webGLEnabled !== false &&
        this.props.settings.renderGlobe === true
      ) {
        //Daemon Starting Up
        this.reDrawEverything();
      } else {
        if (
          this.props.connections != previousprops.connections &&
          this.props.connections !== undefined &&
          previousprops.connections !== undefined
        ) {
          if (this.props.connections != 0 && previousprops.connections != 0) {
            this.reDrawEverything();
          }
        }
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

  closeLicenseModal() {
    this.props.acceptMITAgreement();
  }

  BlockRapper() {
    if (this.props.blockDate === 'Getting Next Block...') {
      return (
        <FormattedMessage
          id="ToolTip.GettingNextBlock"
          defaultMessage="Getting Next Block..."
        />
      );
    } else {
      return this.props.blockDate.toLocaleString(this.props.settings.locale);
    }
  }

  returnLicenseModalInternal() {
    let tempYear = new Date();

    return (
      <div>
        The MIT License (MIT)
        <br />
        Copyright {tempYear.getFullYear()} Nexus
        <br />
        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software and associated documentation files (the
        "Software"), to deal in the Software without restriction, including
        without limitation the rights to use, copy, modify, merge, publish,
        distribute, sublicense, and/or sell copies of the Software, and to
        permit persons to whom the Software is furnished to do so, subject to
        the following conditions:
        <br />
        The above copyright notice and this permission notice shall be included
        in all copies or substantial portions of the Software.
        <br />
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        <br />
        <button
          key="agreement-button-accept"
          className="button primary"
          onClick={() => this.closeLicenseModal()}
        >
          ACCEPT
        </button>
      </div>
    );
  }

  returnExperimentalModalInternal() {
    return (
      <div>
        <h4>
          THIS SOFTWARE IS EXPERIMENTAL AND IN BETA TESTING. BY DEFAULT IT WILL
          NOT USE ANY EXISTING NEXUS WALLET NOR ADDRESSES THAT YOU MAY ALREADY
          HAVE.
          <br />
          <br />
          AS SUCH, THIS WALLET SHOULD{' '}
          <b>
            <u>NOT </u>
          </b>
          BE USED AS YOUR PRIMARY WALLET AND DOING SO MAY AFFECT YOUR ABILITY TO
          ACCESS YOUR COINS UP TO AND INCLUDING LOSING THEM PERMANENTLY.
          <br />
          <br />
          USE THIS SOFTWARE AT YOUR OWN RISK.
        </h4>
        <br key="br2" />
        <button
          key="experiment-button-accept"
          className="button"
          onClick={() => this.props.setExperimentalWarning(false)}
        >
          OK
        </button>
        <button
          key="experiment-button-noshow"
          className="button"
          onClick={() => this.props.setExperimentalWarning(true)}
        >
          Don't show this again
        </button>
      </div>
    );
  }

  connectionsImage() {
    const con = this.props.connections;

    if (con <= 4) {
      return Connections0;
    } else if (con > 4 && con <= 6) {
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

  trustImg() {
    const TW = parseInt(this.props.trustweight / 10);
    switch (TW) {
      case 0:
        return trust00;
        break;
      case 1:
        return trust10;
        break;
      case 2:
        return trust20;
        break;
      case 3:
        return trust30;
        break;
      case 4:
        return trust40;
        break;
      case 5:
        return trust50;
        break;
      case 6:
        return trust60;
        break;
      case 7:
        return trust70;
        break;
      case 8:
        return trust80;
        break;
      case 9:
        return trust90;
        break;
      case 10:
        return trust100;
        break;
      default:
        return trust00;
        break;
    }
  }

  blockWeightImage() {
    const BW = parseInt(this.props.blockweight / 10);
    switch (BW) {
      case 0:
        return blockweight0;
        break;
      case 1:
        return blockweight1;
        break;
      case 2:
        return blockweight2;
        break;
      case 3:
        return blockweight3;
        break;
      case 4:
        return blockweight4;
        break;
      case 5:
        return blockweight5;
        break;
      case 6:
        return blockweight6;
        break;
      case 7:
        return blockweight7;
        break;
      case 8:
        return blockweight8;
        break;
      case 9:
        return blockweight9;
        break;
      default:
        return blockweight0;
        break;
    }
  }

  returnIfDrawLines() {
    //if (testinglines == true)
  }

  isGlobeEnabled() {
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
      return selectedCurrancyValue[0].changePct24Hr;
    } else {
      return '0';
    }
  }

  experimentalModalController() {
    if (
      this.props.settings.acceptedagreement &&
      (this.props.settings.experimentalWarning && this.props.experimentalOpen)
    ) {
      return true;
    } else return false;
  }

  encryptedModalController() {
    if (
      this.daemonAvailable &&
      !this.props.experimentalOpen &&
      this.props.settings.acceptedagreement &&
      (!this.props.encrypted && !this.props.ignoreEncryptionWarningFlag)
    ) {
      return true;
    } else return false;
  }

  // Mandatory React method
  render() {
    const { connections, balance, stake, displayNXSvalues } = this.props;
    return (
      <OverviewPage>
        <Modal
          key="agreement-modal"
          open={!this.props.settings.acceptedagreement}
          onClose={() => true}
          focusTrapped={true}
          center
          showCloseIcon={false}
          classNames={{ modal: 'modal' }}
        >
          <div>
            <h2>
              {' '}
              <FormattedMessage
                id="overview.LicensceAgreement"
                defaultMessage="License Agreement"
              />
            </h2>
            {this.returnLicenseModalInternal()}
          </div>
        </Modal>
        <Modal
          key="experiment-modal"
          focusTrapped={true}
          open={this.experimentalModalController()}
          onClose={() => this.props.setExperimentalWarning(false)}
          center
          classNames={{ modal: 'modal' }}
        >
          {this.returnExperimentalModalInternal()}
        </Modal>
        <Modal
          key="encrypted-modal"
          open={this.encryptedModalController()}
          onClose={() => this.props.ignoreEncryptionWarning()}
          center
          classNames={{ modal: 'modal' }}
        >
          <h3>
            {' '}
            <FormattedMessage
              id="overview.EncryptedModal"
              defaultMessage="Your Wallet Is Not Encrypted!"
            />
          </h3>
          <p>
            <FormattedMessage
              id="overview.Suggestion"
              defaultMessage="You really should encrypt your wallet to keep your Nexus safe."
            />
          </p>
          <NavLink to="/Settings/Unencrypted">
            <button className="button primary">
              <FormattedMessage
                id="overview.TakeMeThere"
                defaultMessage="Take Me There"
              />
            </button>
          </NavLink>
          <button
            className="button negative"
            onClick={() => this.props.ignoreEncryptionWarning()}
          >
            <FormattedMessage id="overview.Ignore" defaultMessage="Ignore" />{' '}
          </button>
        </Modal>

        {!!this.isGlobeEnabled() && (
          <>
            <NetworkGlobe
              handleOnLineRender={e => (this.redrawCurves = e)}
              handleOnRemoveOldPoints={e => (this.removeOldPoints = e)}
              handleOnAddData={e => (this.reDrawEverything = e)}
              handleRemoveAllPoints={e => (this.removeAllPoints = e)}
              pillarColor={
                this.props.settings.customStyling.globePillarColorRGB
              }
              archColor={this.props.settings.customStyling.globeArchColorRGB}
              globeColor={this.props.settings.customStyling.globeMultiColorRGB}
            />
            <MaxmindCopyright>
              <MaxmindLogo src={maxmindLogo} />
              Globe includes GeoLite2
            </MaxmindCopyright>
          </>
        )}

        <Stats left>
          <Stat>
            <div>
              <StatLabel>
                {stake > 0 ? (
                  <span>Balance and Stake</span>
                ) : (
                  <FormattedMessage
                    id="overview.Balance"
                    defaultMessage="Balance"
                  />
                )}{' '}
                (NXS)
              </StatLabel>
              <StatValue>
                {!!connections ? balance + (stake || 0) : '?'}
              </StatValue>
            </div>
            <StatIcon icon={nxsStakeIcon} />
          </Stat>

          <Stat>
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.Balance"
                  defaultMessage="Balance"
                />{' '}
                ({this.props.settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {!!connections ? this.calculateUSDvalue() : '?'}
              </StatValue>
            </div>
            <StatIcon icon={usdIcon} />
          </Stat>

          <Stat>
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.Transactions"
                  defaultMessage="Transactions"
                />
              </StatLabel>
              <StatValue>{!!connections ? this.props.txtotal : '?'}</StatValue>
            </div>
            <StatIcon icon={transactionIcon} />
          </Stat>

          <Stat>
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.MarketPrice"
                  defaultMessage="Market Price"
                />{' '}
                ({this.props.settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0] ? this.marketPriceFormatter() : '?'}
              </StatValue>
            </div>
            <StatIcon icon={chartIcon} />
          </Stat>

          <Stat>
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.MarketCap"
                  defaultMessage="Market Cap"
                />{' '}
                ({this.props.settings.fiatCurrency})
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0] ? this.marketCapFormatter() : '?'}
              </StatValue>
            </div>
            <StatIcon icon={supplyIcon} />
          </Stat>

          <Stat>
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.24hrChange"
                  defaultMessage="24hr Change"
                />{' '}
                ({this.props.settings.fiatCurrency} %)
              </StatLabel>
              <StatValue>
                {!!displayNXSvalues[0]
                  ? this.pctChange24hrFormatter() + '%'
                  : '?'}
              </StatValue>
            </div>
            <StatIcon icon={hours24Icon} />
          </Stat>
        </Stats>

        <Stats right>
          <Stat>
            <StatIcon icon={this.connectionsImage()} />
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.Connections"
                  defaultMessage="Connections"
                />
              </StatLabel>
              <StatValue>
                {!!connections ? this.props.connections : '?'}
              </StatValue>
            </div>
          </Stat>

          <Stat>
            <StatIcon icon={interestIcon} />
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.InterestRate"
                  defaultMessage="Stake Reward"
                />
              </StatLabel>
              <StatValue>
                {!!connections ? this.props.interestweight + '%' : '?'}
              </StatValue>
            </div>
          </Stat>

          <Stat className="relative">
            <StatIcon icon={nxsblocksIcon} />
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.BlockCount"
                  defaultMessage="Block Count"
                />
              </StatLabel>

              <StatValue>
                {!!connections ? this.numberWithCommas(this.props.blocks) : '?'}
              </StatValue>
            </div>
            <span className="tooltip left" style={{ whiteSpace: 'nowrap' }}>
              {this.BlockRapper()}
            </span>
          </Stat>

          <Stat>
            <StatIcon icon={this.blockWeightImage()} />
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.BlockWeightt"
                  defaultMessage="Block Weight"
                />
              </StatLabel>
              <StatValue>
                {!!connections ? this.props.blockweight : '?'}
              </StatValue>
            </div>
          </Stat>

          <Stat>
            <StatIcon icon={this.trustImg()} />
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.TrustWeight"
                  defaultMessage="Trust Weight"
                />
              </StatLabel>
              <StatValue>
                {!!connections ? this.props.trustweight : '?'}
              </StatValue>
            </div>
          </Stat>

          <Stat>
            <StatIcon icon={stakeIcon} />
            <div>
              <StatLabel>
                <FormattedMessage
                  id="overview.StakeWeight"
                  defaultMessage="Stake Weight"
                />
              </StatLabel>
              <StatValue>
                {!!connections ? this.props.stakeweight : '?'}
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
