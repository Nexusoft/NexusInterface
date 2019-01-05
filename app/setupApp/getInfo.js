import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
import * as ac from 'actions/headerActionCreators';
import EncryptionWarningModal from './EncryptionWarningModal';

export default async function getInfo({ dispatch, getState }) {
  dispatch(ac.AddRPCCall('getInfo'));
  let info = null;
  try {
    info = await RPC.PROMISE('getinfo', []);
  } catch (err) {
    console.log(err);
    return;
  }

  delete info.timestamp;
  dispatch(ac.GetInfo(info));
  const state = getState();

  if (info.unlocked_until === undefined) {
    dispatch(ac.Unlock());
    dispatch(ac.Unencrypted());
    if (
      !state.common.encryptionModalShown &&
      !state.settings.settings.ignoreEncryptionWarningFlag
    ) {
      UIController.openModal(EncryptionWarningModal);
      dispatch(ac.ShowEncryptionModal());
    }
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
    loadMyAccounts(store);
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

async function loadMyAccounts({ dispatch }) {
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
