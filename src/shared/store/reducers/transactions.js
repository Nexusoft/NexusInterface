import * as TYPE from 'consts/actionTypes';

const initialState = {
  map: null,
  lastTxtotal: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.FETCH_TRANSACTIONS:
      return {
        ...state,
        map:
          action.payload.list &&
          action.payload.list.reduce((map, tx) => {
            map[tx.txid] = tx;
            return map;
          }, {}),
        lastTxtotal: action.payload.txtotal,
      };

    case TYPE.ADD_TRANSACTIONS:
      return {
        ...state,
        map:
          action.payload.list &&
          action.payload.list.reduce(
            (map, tx) => {
              map[tx.txid] = tx;
              return map;
            },
            { ...state.map }
          ),
        lastTxtotal: action.payload.txtotal,
      };

    case TYPE.UPDATE_TRANSACTION:
      return {
        ...state,
        map: {
          ...state.map,
          [action.payload.txid]: action.payload,
        },
      };

    // case TYPE.SET_WALL_TRANS:
    //   return {
    //     ...state,
    //     walletitems: action.payload,
    //   };

    // case TYPE.SET_TRANSACTION_MAP:
    //   let tempMap = new Map();
    //   state.walletitems.forEach(element => {
    //     tempMap.set(
    //       element.time.toString() + element.account + element.amount.toString(),
    //       element
    //     );
    //   });
    //   return {
    //     ...state,
    //     walletitemsMap: tempMap,
    //   };

    // case TYPE.SET_SELECTED_MYACCOUNT:
    //   return {
    //     ...state,
    //     selectedAccount: action.payload,
    //   };
    //   break;
    // case TYPE.UPDATE_CONFIRMATIONS:
    //   let tempNewItems = state.walletitems.map((e, i) => {
    //     let replaceElement = action.payload[i];
    //     if (replaceElement != undefined && e.txid == replaceElement.txid) {
    //       return {
    //         ...e,
    //         confirmations: replaceElement.confirmations,
    //       };
    //     } else {
    //       return e;
    //     }
    //   });
    //   if (state.walletitems.length != action.payload.length) {
    //     // A new transaction came in before we could update, revert so that there is no issue.
    //     tempNewItems = state.walletitems;
    //   }
    //   return {
    //     ...state,
    //     walletitems: tempNewItems,
    //   };
    //   break;

    // case TYPE.UPDATE_COINVALUE:
    //   return {
    //     ...state,
    //     walletitems: state.walletitems.map((e, i) => {
    //       let replaceElement = action.payload;
    //       if (replaceElement != undefined && e.time == replaceElement.time) {
    //         return {
    //           ...e,
    //           value: replaceElement.value,
    //         };
    //       } else {
    //         return e;
    //       }
    //     }),
    //   };
    //   break;
    // case TYPE.UPDATE_FEEVALUE:
    //   let tempTransactionsWithfeeValues = state.walletitems.map((e, i) => {
    //     let replaceElement = action.payload.get(e.time);
    //     if (replaceElement != undefined) {
    //       return {
    //         ...e,
    //         fee: replaceElement,
    //       };
    //     } else {
    //       return e;
    //     }
    //   });
    //   return {
    //     ...state,
    //     walletitems: tempTransactionsWithfeeValues,
    //   };
    //   break;

    default:
      return state;
  }
};
