import React from 'react';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
import * as ac from 'actions/setupAppActionCreators';
import { loadMyAccounts } from 'actions/accountActionCreators';
import bootstrap, { checkBootStrapFreeSpace, checkFreeSpace } from 'actions/bootstrap';
import EncryptionWarningModal from './EncryptionWarningModal';
import Text from 'components/Text';

export default function getInfo() {
  return async (dispatch, getState) => {
    dispatch(ac.AddRPCCall('getInfo'));
    let info = null;
    try {
      info = await RPC.PROMISE('getinfo', []);
    } catch (err) {
      console.log(err);
      dispatch(ac.clearOverviewVariables());
      return;
    }
    // console.log(info);
    const state = getState();
    const oldInfo = state.overview;

    if (info.unlocked_until === undefined && info.locked === undefined) {
      dispatch(ac.Unlock());
      dispatch(ac.Unencrypted());
      if (
        !state.common.encryptionModalShown &&
        !state.settings.encryptionWarningDisabled
      ) {
        UIController.openModal(EncryptionWarningModal);
        dispatch(ac.showEncryptionWarningModal());
      }
    } else if (
      info.unlocked_until === 0 ||
      (info.unlocked_until === undefined && info.locked === true)
    ) {
      dispatch(ac.Lock());
      dispatch(ac.Encrypted());
    } else if (
      info.unlocked_until >= 0 ||
      (info.unlocked_until === undefined && info.locked === false)
    ) {
      dispatch(ac.Unlock());
      dispatch(ac.Encrypted());
    }

    if (info.connections !== undefined && oldInfo.connections === undefined) {
      dispatch(await loadMyAccounts());
    }

    if (info.blocks !== oldInfo.blocks) {
      const connectioncount = await RPC.PROMISE('getconnectioncount', []);

      if (connectioncount > 0) {
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
          settings: { manualDaemon, bootstrapSuggestionDisabled },
        } = state;
        // 172800 = (100 * 24 * 60 * 60) / 50
        // which is the approximate number of blocks produced in 100 days
        const isFarBehind = highestPeerBlock - info.blocks > 172800;
        if (
          isFarBehind &&
          !bootstrapSuggestionDisabled &&
          !manualDaemon &&
          info.connections !== undefined
        ) {
          (async () => {
            const enoughSpace = await checkFreeSpace();
            if (enoughSpace) dispatch(bootstrap({ suggesting: true }));
          })();
        }
      }
    }
    if (info.txtotal > oldInfo.txtotal) {
      const txList = await RPC.PROMISE('listtransactions');
      if (txList) {
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
            UIController.showNotification(
              <Text id="Alert.Genesis" />,
              'success'
            );
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

    const enoughSpace = await checkFreeSpace(10);
    if (!enoughSpace) {
      UIController.showNotification(
        {content: "WARNING LOW DISK SPACE",
        type:'error',autoClose: false}
      );
    }

    delete info.timestamp;
    dispatch(ac.GetInfo(info));

  };
}

async function showDesktopNotif(title, message) {
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    const notif = new Notification(title, { body: message });
  }
}
