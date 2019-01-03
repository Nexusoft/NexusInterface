// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import electron from 'electron';
import styled from '@emotion/styled';

// Internal Global Dependencies
import * as RPC from 'scripts/rpc';
import * as actionsCreators from 'actions/headerActionCreators';
import configuration from 'api/configuration';
import Icon from 'components/Icon';
import HorizontalLine from 'components/HorizontalLine';
import { consts, timing, animations } from 'styles';
import { color } from 'utils';
import UIController from 'components/UIController';

// Internal Local Dependencies
import BootstrapModal from './BootstrapModal';
import SignInStatus from './StatusIcons/SignInStatus';
import StakingStatus from './StatusIcons/StakingStatus';
import SyncStatus from './StatusIcons/SyncStatus';
import DaemonStatus from './DaemonStatus';
import logoFull from './logo-full-beta.sprite.svg';
import './style.css';

const HeaderComponent = styled.header(({ theme }) => ({
  gridArea: 'header',
  position: 'relative',
  top: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, rgba(0,0,0,.6), transparent)',
  color: theme.primary,
  zIndex: 999,
}));

const LogoLink = styled(Link)(({ theme }) => ({
  position: 'relative',
  animation: `${animations.fadeInAndExpand} ${timing.slow} ${
    consts.enhancedEaseOut
  }`,
  transitionProperty: 'filter',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',
  filter: `drop-shadow(0 0 8px ${color.fade(
    color.lighten(theme.primary, 0.2),
    0.3
  )})`,

  '&:hover': {
    filter: `drop-shadow(0 0 10px ${theme.primary}) brightness(110%)`,
  },
}));

const Logo = styled(Icon)(({ theme }) => ({
  display: 'block',
  height: 50,
  width: 'auto',
  filter: 'var(--nxs-logo)',
  fill: theme.primary,
}));

const Beta = styled.div(({ theme }) => ({
  fontSize: 12,
  position: 'absolute',
  bottom: 3,
  right: -26,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: theme.light,
}));

const StatusIcons = styled.div({
  position: 'absolute',
  top: 24,
  right: 40,
  animation: `${animations.fadeIn} ${timing.slow} ${consts.enhancedEaseOut}`,
  display: 'flex',
  alignItems: 'center',
});

const UnderHeader = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: theme.light,
}));

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common,
    ...state.settings,
    ...state.intl,
  };
};
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Header extends Component {
  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (nextProps.unlocked_until === undefined) {
      this.props.Unlock();
      this.props.Unencrypted();
    } else if (nextProps.unlocked_until === 0) {
      this.props.Lock();
      this.props.Encrypted();
    } else if (nextProps.unlocked_until >= 0) {
      this.props.Unlock();
      this.props.Encrypted();
    }

    if (
      this.props.connections === undefined &&
      nextProps.connections !== undefined
    ) {
      this.loadMyAccounts();
    }

    if (nextProps.blocks !== this.props.blocks) {
      RPC.PROMISE('getpeerinfo', [], this.props)
        .then(peerresponse => {
          let hpb = 0;
          peerresponse.forEach(element => {
            if (element.height >= hpb) {
              hpb = element.height;
            }
          });

          return hpb;
        })
        .then(hpb => {
          this.props.SetHighestPeerBlock(hpb);
        });
    }

    if (this.props.heighestPeerBlock > nextProps.blocks) {
      this.props.SetSyncStatus(false);
    } else {
      this.props.SetSyncStatus(true);
    }

    if (this.props.txtotal < nextProps.txtotal) {
      RPC.PROMISE('listtransactions').then(payload => {
        let MRT = payload.reduce((a, b) => {
          if (a.time > b.time) {
            return a;
          } else {
            return b;
          }
        });

        if (MRT.category === 'receive') {
          this.doNotify('Received', MRT.amount + ' NXS');
          UIController.showNotification(
            <Text id="Alert.Received" />,
            'success'
          );
        } else if (MRT.category === 'send') {
          this.doNotify('Sent', MRT.amount + ' NXS');
          UIController.showNotification(<Text id="Alert.Sent" />, 'success');
        } else if (MRT.category === 'genesis') {
          this.doNotify('Genesis', MRT.amount + ' NXS');
          UIController.showNotification(<Text id="Alert.Genesis" />, 'success');
        } else if (MRT.category === 'trust') {
          this.doNotify('Trust', MRT.amount + ' NXS');
          UIController.showNotification(
            <Text id="Alert.TrustTransaction" />,
            'success'
          );
        }
      });
    } else {
      return null;
    }
  }

  // Class methods
  loadMyAccounts() {
    RPC.PROMISE('listaccounts', [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(account =>
          RPC.PROMISE('getaddressesbyaccount', [account])
        )
      ).then(payload => {
        let validateAddressPromises = [];

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE('validateaddress', [address])
            );
          });
        });

        Promise.all(validateAddressPromises).then(payload => {
          let accountsList = [];
          let myaccts = payload.map(e => {
            if (e.ismine && e.isvalid) {
              let index = accountsList.findIndex(ele => {
                if (ele.account === e.account) {
                  return ele;
                }
              });
              let indexDefault = accountsList.findIndex(ele => {
                if (ele.account == '' || ele.account == 'default') {
                  return ele;
                }
              });

              if (e.account === '' || e.account === 'default') {
                if (index === -1 && indexDefault === -1) {
                  accountsList.push({
                    account: 'default',
                    addresses: [e.address],
                  });
                } else {
                  accountsList[indexDefault].addresses.push(e.address);
                }
              } else {
                if (index === -1) {
                  accountsList.push({
                    account: e.account,
                    addresses: [e.address],
                  });
                } else {
                  accountsList[index].addresses.push(e.address);
                }
              }
            }
          });
          this.props.MyAccountsList(accountsList);
        });
      });
    });
  }

  doNotify(context, message) {
    Notification.requestPermission().then(result => {
      var myNotification = new Notification(context, {
        body: message,
      });
    });
  }

  // Mandatory React method
  render() {
    const { settings, connections, daemonAvailable } = this.props;

    return (
      <HeaderComponent>
        <BootstrapModal {...this.props} />

        <LogoLink to="/">
          <Logo icon={logoFull} />
          <Beta>BETA</Beta>
        </LogoLink>

        <UnderHeader>
          <HorizontalLine />
          <DaemonStatus {...this.props} />
        </UnderHeader>

        {!!connections && !!daemonAvailable && (
          <StatusIcons>
            <SyncStatus {...this.props} />
            <SignInStatus {...this.props} />
            {/* wrap this in a check too... */}
            <StakingStatus {...this.props} />
          </StatusIcons>
        )}
      </HeaderComponent>
    );
  }
}

// Mandatory React-Redux method
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Header)
);
