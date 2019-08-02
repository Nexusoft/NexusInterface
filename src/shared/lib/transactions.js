import { fetchNewTransactions, updateTransaction } from 'actions/transactions';
import { observeStore } from 'store';

const unsubscribers = {};
let started = false;

export function autoUpdateTransactions() {
  if (!started) {
    observeStore(
      ({ core: { info } }) => info && info.txtotal,
      (txtotal, store) => {
        const {
          transactions: { lastTxtotal },
        } = store.getState();
        if (txtotal && (!lastTxtotal || txtotal > lastTxtotal)) {
          store.dispatch(fetchNewTransactions());
        }
      }
    );

    started = true;
  }
}

export function watchTxConfirmations(txid) {
  if (unsubscribers[txid]) return;
  unsubscribers[txid] = observeStore(
    ({ core: { info } }) => info && info.blocks,
    async (blocks, store) => {
      if (blocks) {
        await updateTransaction(txid);
        const {
          transactions: { map },
          settings: { minConfirmations },
        } = store.getState();
        const minConf = Number(minConfirmations);
        if (minConf && map[txid].confirmations >= minConf) {
          Object.values(map).forEach(tx => {
            if (tx.confirmations >= minConf) {
              unsubscribers[txid]();
              delete unsubscribers[txid];
            }
          });
        }
      }
    }
  );
}
