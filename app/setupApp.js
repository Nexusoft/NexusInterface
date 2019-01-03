// External
import { remote } from 'electron';
import path from 'path';

// Internal
import { GetSettings, SaveSettings } from 'api/settings';
import * as ac from 'actions/headerActionCreators';
import * as RPC from 'scripts/rpc';
import UIController from 'components/UIController';
import MenuBuilder from './menuBuilder';

let tray = window.tray || null;

export default function setupApp(store, history) {
  const { dispatch } = store;
  const menuBuilder = new MenuBuilder(store, history);
  menuBuilder.buildMenu();

  if (!tray) setupTray(dispatch);

  setupSettings(dispatch);

  dispatch(ac.LoadAddressBook());

  getInfo(store);
  setInterval(() => getInfo(store), 20000);

  dispatch(ac.SetMarketAveData());
  setInterval(function() {
    dispatch(ac.SetMarketAveData());
  }, 900000);

  const mainWindow = remote.getCurrentWindow();
  mainWindow.on('close', e => {
    e.preventDefault();
    store.dispatch(ac.clearOverviewVariables());
    UIController.showNotification('Closing Nexus...');
  });
}

function setupTray(dispatch) {
  const mainWindow = remote.getCurrentWindow();

  const root =
    process.env.NODE_ENV === 'development'
      ? __dirname
      : configuration.GetAppResourceDir();
  const fileName =
    process.platform == 'darwin'
      ? 'Nexus_Tray_Icon_Template_16.png'
      : 'Nexus_Tray_Icon_32.png';
  const trayImage = path.join(root, 'images', 'tray', fileName);
  tray = new remote.Tray(trayImage);

  const pressedFileName = 'Nexus_Tray_Icon_Highlight_16.png';
  const pressedImage = path.join(root, 'images', 'tray', pressedFileName);
  tray.setPressedImage(pressedImage);

  const contextMenu = remote.Menu.buildFromTemplate([
    {
      label: 'Show Nexus',
      click: function() {
        mainWindow.show();
      },
    },
    {
      label: 'Quit Nexus',
      click() {
        dispatch(ac.clearOverviewVariables());
        UIController.showNotification('Closing Nexus...');
        mainWindow.close();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

function setupSettings(dispatch) {
  const settings = GetSettings();
  if (Object.keys(settings).length < 1) {
    SaveSettings({ ...settings, keepDaemon: false });
  } else {
    dispatch(ac.setSettings(settings));
  }
}

async function getInfo({ dispatch, getState }) {
  dispatch(ac.AddRPCCall('getInfo'));
  let info = null;
  try {
    info = await RPC.PROMISE('getinfo', []);
  } catch (err) {
    console.log(err);
    dispatch(ac.DaemonUnavailable());
    return;
  }

  delete info.timestamp;
  dispatch(ac.DaemonAvailable());
  dispatch(ac.GetInfo(info));
  const state = getState();

  if (info.unlocked_until === undefined) {
    dispatch(ac.Unlock());
    dispatch(ac.Unencrypted());
  } else if (info.unlocked_until === 0) {
    dispatch(ac.Lock());
    dispatch(ac.Encrypted());
  } else if (info.unlocked_until >= 0) {
    dispatch(ac.Unlock());
    dispatch(ac.Encrypted());
  }

  if (
    state.overview.connections === undefined &&
    info.connections !== undefined
  ) {
    loadMyAccounts();
  }

  if (state.overview.blocks !== info.blocks) {
    const peerresponse = await RPC.PROMISE('getpeerinfo', []);

    const hpb = peerresponse.reduce(
      (highest, element) => (element.height >= hpb ? element.height : highest),
      0
    );
    dispatch(ac.SetHighestPeerBlock(hpb));
  }

  if (state.overview.heighestPeerBlock > info.blocks) {
    dispatch(ac.SetSyncStatus(false));
  } else {
    dispatch(ac.SetSyncStatus(true));
  }

  if (state.overview.txtotal < info.txtotal) {
    const txList = await RPC.PROMISE('listtransactions');
    const mostRecentTx = txList.reduce((a, b) => (a.time > b.time ? a : b));

    switch (mostRecentTx.category) {
      case 'receive':
        showDesktopNotif('Received', mostRecentTx.amount + ' NXS');
        UIController.showNotification(<Text id="Alert.Received" />, 'success');
        break;
      case 'send':
        showDesktopNotif('Sent', mostRecentTx.amount + ' NXS');
        UIController.showNotification(<Text id="Alert.Sent" />, 'success');
        break;
      case 'genesis':
        showDesktopNotif('Genesis', mostRecentTx.amount + ' NXS');
        UIController.showNotification(<Text id="Alert.Genesis" />, 'success');
        break;
      case 'trust':
        showDesktopNotif('Trust', mostRecentTx.amount + ' NXS');
        UIController.showNotification(
          <Text id="Alert.TrustTransaction" />,
          'success'
        );
        break;
    }
  }
}

async function loadMyAccounts(dispatch) {
  const accList = await RPC.PROMISE('listaccounts', [0]);

  const addrList = await Promise.all(
    Object.keys(accList).map(account =>
      RPC.PROMISE('getaddressesbyaccount', [account])
    )
  );

  const validateAddressPromises = addrList.reduce(
    (list, element) => [
      ...list,
      ...element.addresses.map(address =>
        RPC.PROMISE('validateaddress', [address])
      ),
    ],
    []
  );
  const validations = await Promise.all(validateAddressPromises);

  const accountList = [];
  validations.forEach(e => {
    if (e.ismine && e.isvalid) {
      const index = accountList.findIndex(ele => ele.account === e.account);
      const indexDefault = accountList.findIndex(
        ele => ele.account === '' || ele.account === 'default'
      );

      if (e.account === '' || e.account === 'default') {
        if (index === -1 && indexDefault === -1) {
          accountList.push({
            account: 'default',
            addresses: [e.address],
          });
        } else {
          accountList[indexDefault].addresses.push(e.address);
        }
      } else {
        if (index === -1) {
          accountList.push({
            account: e.account,
            addresses: [e.address],
          });
        } else {
          accountList[index].addresses.push(e.address);
        }
      }
    }
  });

  dispatch(ac.MyAccountsList(accountList));
}

async function showDesktopNotif(title, message) {
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    new Notification(title, { body: message });
  }
}
