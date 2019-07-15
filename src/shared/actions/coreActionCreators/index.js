import React from 'react';

import { openModal, showNotification } from 'actions/globalUI';
import rpc from 'lib/rpc';
import * as ac from 'actions/setupAppActionCreators';
import * as TYPE from 'consts/actionTypes';
import { loadMyAccounts } from 'actions/accountActionCreators';
import bootstrap, { checkFreeSpace } from 'actions/bootstrap';
import EncryptionWarningModal from './EncryptionWarningModal';
import Text from 'components/Text';

export function getInfo() {
  return async (dispatch, getState) => {
    dispatch(ac.AddRPCCall('getInfo'));
    let info = null;
    try {
      info = await rpc('getinfo', []);
    } catch (err) {
      dispatch(clearCoreInfo());
      if (err) console.error(err);
      return;
    }
    // console.log(info);
    const state = getState();
    const oldInfo = state.core.info;

    if (info.unlocked_until === undefined && info.locked === undefined) {
      dispatch(ac.Unlock());
      dispatch(ac.Unencrypted());
      if (
        !state.common.encryptionModalShown &&
        !state.settings.encryptionWarningDisabled &&
        state.settings.acceptedAgreement
      ) {
        dispatch(openModal(EncryptionWarningModal));
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
    if (info.stakeweight != 0) {
      info.stakeweight = info.stakeweight.toFixed(6);
    }
    if (info.trustweight != 0) {
      info.trustweight = info.trustweight.toFixed(6);
    }
    if (info.blockweight != 0) {
      info.blockweight = info.blockweight.toFixed(6);
    }

    if (!info.interestweight) {
      if (info.stakerate != 0) {
        info.interestweight = info.stakerate.toFixed(6);
      } else {
        info.interestweight = info.stakerate;
      }
    }

    if (info.connections !== undefined && oldInfo.connections === undefined) {
      dispatch(await loadMyAccounts());
    }

    if (info.blocks !== oldInfo.blocks) {
      const connectioncount = await rpc('getconnectioncount', []);

      if (connectioncount > 0) {
        const peerresponse = await rpc('getpeerinfo', []);
        if (peerresponse != null) {
          const highestPeerBlock = peerresponse.reduce(
            (highest, element) =>
              element.height >= highest ? element.height : highest,
            0
          );
          // console.log(peerresponse);
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
              const enoughSpace = await checkFreeSpace(1);
              if (enoughSpace) dispatch(bootstrap({ suggesting: true }));
            })();
          }
        }
      }
    }
    if (info.txtotal > oldInfo.txtotal) {
      const txList = await rpc('listtransactions', []);
      if (txList) {
        const mostRecentTx = txList.reduce((a, b) => (a.time > b.time ? a : b));

        switch (mostRecentTx.category) {
          case 'receive':
            showDesktopNotif('Received', mostRecentTx.amount + ' NXS');
            dispatch(showNotification(<Text id="Alert.Received" />, 'success'));
            break;
          case 'send':
            showDesktopNotif('Sent', mostRecentTx.amount + ' NXS');
            dispatch(showNotification(<Text id="Alert.Sent" />, 'success'));
            break;
          case 'genesis':
            showDesktopNotif('Genesis', mostRecentTx.amount + ' NXS');
            dispatch(showNotification(<Text id="Alert.Genesis" />, 'success'));
            break;
          case 'trust':
            showDesktopNotif('Trust', mostRecentTx.amount + ' NXS');
            dispatch(
              showNotification(<Text id="Alert.TrustTransaction" />, 'success')
            );
            break;
        }
      }
    }

    // const enoughSpace = await checkFreeSpace(1);
    // if (!enoughSpace) {

    //   dispatch(showNotification('WARNING LOW DISK SPACE', {
    //     type: 'error',
    //     autoClose: false,
    //   }));
    // }

    delete info.timestamp;
    dispatch({ type: TYPE.GET_INFO, payload: info });
  };
}

async function showDesktopNotif(title, message) {
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    const notif = new Notification(title, { body: message });
  }
}

export const clearCoreInfo = () => ({
  type: TYPE.CLEAR_CORE_INFO,
});

export const getDifficulty = () => async dispatch => {
  const diff = await rpc('getdifficulty', []);
  dispatch({ type: TYPE.GET_DIFFICULTY, payload: diff });
};
