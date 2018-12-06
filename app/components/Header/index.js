// External Dependencies
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import electron from 'electron'
import Modal from 'react-responsive-modal'
import CustomProperties from 'react-custom-properties'
import log from 'electron-log'
import styled from 'react-emotion'
import { FormattedMessage } from 'react-intl'

// Internal Global Dependencies
import MenuBuilder from 'menu'
import * as TYPE from 'actions/actiontypes'
import * as RPC from 'scripts/rpc'
import * as actionsCreators from 'actions/headerActionCreators'
import { GetSettings, SaveSettings } from 'api/settings'
import GOOGLE from 'scripts/googleanalytics'
import configuration from 'api/configuration'
import Icon from 'components/common/Icon'
import HorizontalLine from 'components/common/HorizontalLine'
import { colors, consts, timing, animations } from 'styles'

// Internal Local Dependencies
import NotificationModal from './NotificationModal'
import BootstrapModal from './BootstrapModal'
import SignInStatus from './StatusIcons/SignInStatus'
import StakingStatus from './StatusIcons/StakingStatus'
import SyncStatus from './StatusIcons/SyncStatus'
import DaemonStatus from './DaemonStatus'
import logoFull from './logo-full-beta.sprite.svg'
import './style.css'

const HeaderWrapper = styled('header')({
  gridArea: 'header',
  position: 'relative',
  top: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.primary,
  zIndex: 999,
})

const LogoLink = styled(Link)({
  position: 'relative',
  animationName: animations.expand,
  animationDuration: timing.slow,
  animationTimingFunction: consts.enhancedEaseOut,
})

const Logo = styled(Icon)({
  display: 'block',
  height: 50,
  filter: 'var(--nxs-logo)',
  fill: colors.primary,
})

const Beta = styled('div')({
  color: 'white',
  fontSize: 12,
  position: 'absolute',
  bottom: 3,
  right: -26,
  letterSpacing: 1,
  textTransform: 'uppercase',
})

const StatusIcons = styled('div')({
  position: 'absolute',
  top: 24,
  right: 40,
})

const UnderHeader = styled('div')({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: colors.light,
})

var tray = tray || null
let mainWindow = electron.remote.getCurrentWindow()
var checkportinterval // shouldbemoved

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common,
    ...state.settings,
    ...state.intl,
  }
}
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch)

class Header extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    var self = this

    let settings = GetSettings()

    if (settings === undefined) {
      SaveSettings({ ...this.props.settings, keepDaemon: false })
    } else {
      this.props.setSettings(settings)
    }

    const menuBuilder = new MenuBuilder(electron.remote.getCurrentWindow().id)
    menuBuilder.buildMenu(self)

    this.props.SetGoogleAnalytics(GOOGLE)

    this.props.SetMarketAveData()
    this.props.LoadAddressBook()

    if (tray === null) this.setupTray()

    this.props.GetInfoDump()

    self.set = setInterval(function() {
      self.props.AddRPCCall('getInfo')
      self.props.GetInfoDump()
    }, 20000)
    const core = electron.remote.getGlobal('core')
    core.on('starting', () => {
      self.set = setInterval(function() {
        self.props.AddRPCCall('getInfo')
        self.props.GetInfoDump()
      }, 20000)
    })

    core.on('stopping', () => {
      clearInterval(self.set)
      this.props.clearOverviewVariables()
    })
    this.props.SetMarketAveData()
    self.mktData = setInterval(function() {
      console.log('MARKET')
      self.props.SetMarketAveData()
    }, 900000)

    this.props.history.push('/')
  }
  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (nextProps.unlocked_until === undefined) {
      this.props.Unlock()
      this.props.Unencrypted()
    } else if (nextProps.unlocked_until === 0) {
      this.props.Lock()
      this.props.Encrypted()
    } else if (nextProps.unlocked_until >= 0) {
      this.props.Unlock()
      this.props.Encrypted()
    }

    if (
      this.props.connections === undefined &&
      nextProps.connections !== undefined
    ) {
      this.loadMyAccounts()
    }

    if (nextProps.blocks !== this.props.blocks) {
      RPC.PROMISE('getpeerinfo', [], this.props)
        .then(peerresponse => {
          let hpb = 0
          peerresponse.forEach(element => {
            if (element.height >= hpb) {
              hpb = element.height
            }
          })

          return hpb
        })
        .then(hpb => {
          this.props.SetHighestPeerBlock(hpb)
        })
    }

    if (this.props.heighestPeerBlock > nextProps.blocks) {
      this.props.SetSyncStatus(false)
    } else {
      this.props.SetSyncStatus(true)
    }

    if (this.props.txtotal < nextProps.txtotal) {
      RPC.PROMISE('listtransactions').then(payload => {
        let MRT = payload.reduce((a, b) => {
          if (a.time > b.time) {
            return a
          } else {
            return b
          }
        })

        if (MRT.category === 'receive') {
          this.doNotify('Received', MRT.amount + ' NXS')
          this.props.OpenModal('receive')
        } else if (MRT.category === 'send') {
          this.doNotify('Sent', MRT.amount + ' NXS')
          this.props.OpenModal('send')
        } else if (MRT.category === 'genesis') {
          this.doNotify('Genesis', MRT.amount + ' NXS')
          this.props.OpenModal('genesis')
        } else if (MRT.category === 'trust') {
          this.doNotify('Trust', MRT.amount + ' NXS')
          this.props.OpenModal('trust')
        }
      })
    } else {
      return null
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
        let validateAddressPromises = []

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE('validateaddress', [address])
            )
          })
        })

        Promise.all(validateAddressPromises).then(payload => {
          let accountsList = []
          let myaccts = payload.map(e => {
            if (e.ismine && e.isvalid) {
              let index = accountsList.findIndex(ele => {
                if (ele.account === e.account) {
                  return ele
                }
              })
              let indexDefault = accountsList.findIndex(ele => {
                if (ele.account == '' || ele.account == 'default') {
                  return ele
                }
              })

              if (e.account === '' || e.account === 'default') {
                if (index === -1 && indexDefault === -1) {
                  accountsList.push({
                    account: 'default',
                    addresses: [e.address],
                  })
                } else {
                  accountsList[indexDefault].addresses.push(e.address)
                }
              } else {
                if (index === -1) {
                  accountsList.push({
                    account: e.account,
                    addresses: [e.address],
                  })
                } else {
                  accountsList[index].addresses.push(e.address)
                }
              }
            }
          })
          this.props.MyAccountsList(accountsList)
        })
      })
    })
  }

  doNotify(context, message) {
    Notification.requestPermission().then(result => {
      var myNotification = new Notification(context, {
        body: message,
      })
    })
  }

  setupTray() {
    let trayImage = ''
    let mainWindow = electron.remote.getCurrentWindow()

    const path = require('path')
    const app = electron.app || electron.remote.app

    if (process.env.NODE_ENV === 'development') {
      if (process.platform == 'darwin') {
        trayImage = path.join(
          __dirname,
          'images',
          'tray',
          'Nexus_Tray_Icon_Template_16.png'
        )
      } else {
        trayImage = path.join(
          __dirname,
          'images',
          'tray',
          'Nexus_Tray_Icon_32.png'
        )
      }
    } else {
      if (process.platform == 'darwin') {
        trayImage = path.join(
          configuration.GetAppResourceDir(),
          'images',
          'tray',
          'Nexus_Tray_Icon_Template_16.png'
        )
      } else {
        trayImage = path.join(
          configuration.GetAppResourceDir(),
          'images',
          'tray',
          'Nexus_Tray_Icon_32.png'
        )
      }
    }

    tray = new electron.remote.Tray(trayImage)

    if (process.env.NODE_ENV === 'development') {
      if (process.platform == 'darwin') {
        tray.setPressedImage(
          path.join(
            __dirname,
            'images',
            'tray',
            'Nexus_Tray_Icon_Highlight_16.png'
          )
        )
      }
    } else {
      tray.setPressedImage(
        path.join(
          configuration.GetAppResourceDir(),
          'images',
          'tray',
          'Nexus_Tray_Icon_Highlight_16.png'
        )
      )
    }
    tray.on('double-click', () => {
      mainWindow.show()
    })

    var contextMenu = electron.remote.Menu.buildFromTemplate([
      {
        label: 'Show Nexus',
        click: function() {
          mainWindow.show()
        },
      },
      {
        label: 'Quit Nexus',
        click: function() {
          log.info('header/index.js contextmenu: close and kill')
          let settings = GetSettings()
          settings.keepDaemon = false
          SaveSettings(settings)
          if (settings.manualDaemon != true) {
            RPC.PROMISE('stop', []).then(payload => {
              setTimeout(() => {
                mainWindow.close()
              }, 1000)
            })
          }
          mainWindow.close()
        },
      },
    ])

    tray.setContextMenu(contextMenu)
  }

  // Mandatory React method
  render() {
    const { settings } = this.props

    return (
      <HeaderWrapper>
        <CustomProperties
          global
          properties={{
            '--color-1': settings.customStyling.MC1,
            '--color-2': settings.customStyling.MC2,
            '--color-3': settings.customStyling.MC3,
            '--color-4': settings.customStyling.MC4,
            '--color-5': settings.customStyling.MC5,
            '--nxs-logo': settings.customStyling.NXSlogo,
            '--icon-menu': settings.customStyling.iconMenu,
            '--footer': settings.customStyling.footer,
            '--footer-hover': settings.customStyling.footerHover,
            '--footer-active': settings.customStyling.footerActive,
            '--background-main-image': `url('${settings.wallpaper}')`,
            '--panel-background-color': settings.customStyling.pannelBack,
            '--maxMind-copyright': settings.customStyling.maxMindCopyright,
          }}
        />

        <NotificationModal {...this.props} />
        <BootstrapModal {...this.props} />

        <LogoLink to="/">
          <Logo icon={logoFull} />
          <Beta>BETA</Beta>
        </LogoLink>

        <UnderHeader>
          <HorizontalLine />
          <DaemonStatus {...this.props} />
        </UnderHeader>

        <StatusIcons>
          <SignInStatus {...this.props} />
          {/* wrap this in a check too... */}
          <StakingStatus {...this.props} />
          <SyncStatus {...this.props} />
        </StatusIcons>
      </HeaderWrapper>
    )
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)
