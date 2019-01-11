import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
import * as ac from 'actions/setupAppActionCreators';
import bootstrap, { checkFreeSpace } from 'actions/bootstrap';
import EncryptionWarningModal from './EncryptionWarningModal';

export default function getInfo() {
  return async (dispatch, getState) => {
    dispatch(ac.AddRPCCall('getInfo'));
    let info = null;
    try {
      info = await RPC.PROMISE('getinfo', []);
    } catch (err) {
      console.log(err);
      return;
    }

    const state = getState();
    const oldInfo = state.overview;

    if (info.unlocked_until === undefined) {
      dispatch(ac.Unlock());
      dispatch(ac.Unencrypted());
      if (
        !state.common.encryptionModalShown &&
        !state.settings.settings.ignoreEncryptionWarningFlag
      ) {
        UIController.openModal(EncryptionWarningModal);
      }
    } else if (info.unlocked_until === 0) {
      dispatch(ac.Lock());
      dispatch(ac.Encrypted());
    } else if (info.unlocked_until >= 0) {
      dispatch(ac.Unlock());
      dispatch(ac.Encrypted());
    }

    if (info.connections !== undefined && oldInfo.connections === undefined) {
      loadMyAccounts(dispatch);
    }

    if (info.blocks !== oldInfo.blocks) {
      const peerresponse = await RPC.PROMISE('getpeerinfo', []);
      const highestPeerBlock = peerresponse.reduce(
        (highest, element) =>
          element.height >= highest ? element.height : highest,
        0
      );

      dispatch(ac.SetHighestPeerBlock(highestPeerBlock));
      if (highestPeerBlock > info.blocks) {
        dispatch(ac.SetSyncStatus(false));
      } else {
        dispatch(ac.SetSyncStatus(true));
      }

      if (!oldInfo.blocks || info.blocks > oldInfo.blocks) {
        let newDate = new Date();
        dispatch(ac.BlockDate(newDate));
      }

      const {
        settings: {
          manualDaemon,
          settings: { bootstrap: bootstrapSetting },
        },
      } = state;
      // 172800 = (100 * 24 * 60 * 60) / 50
      // which is the approximate number of blocks produced in 100 days
      const isFarBehind = highestPeerBlock - info.blocks > 172800;
      if (
        isFarBehind &&
        bootstrapSetting &&
        !manualDaemon &&
        info.connections !== undefined
      ) {
        (async () => {
          const enoughSpace = await checkFreeSpace();
          if (enoughSpace) dispatch(bootstrap({ suggesting: true }));
        })();
      }
    }

    if (info.txtotal > oldInfo.txtotal) {
      const txList = await RPC.PROMISE('listtransactions');
      const mostRecentTx = txList.reduce((a, b) => (a.time > b.time ? a : b));

      switch (mostRecentTx.category) {
        case 'receive':
          showDesktopNotif('Received', mostRecentTx.amount + ' NXS');
          UIController.showNotification(
            <Text id="Alert.Received" />,
            'success'
          );
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

    delete info.timestamp;
    dispatch(ac.GetInfo(info));
  };
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
