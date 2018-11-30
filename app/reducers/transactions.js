import * as TYPE from 'actions/actiontypes'

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_WALL_TRANS:
      return {
        ...state,
        walletitems: action.payload
      }
      break
    case TYPE.SET_TRANSACTION_SENDAGAIN:
      return {
        ...state,
        sendagain: action.payload
      }
      break
    case TYPE.SET_TRANSACTION_EXPLOREINFO:
      return {
        ...state,
        exploreinfo: action.payload
      }
      break
    case TYPE.UPDATE_CONFIRMATIONS:
      let tempNewItems = state.walletitems.map((e, i) => {
        let replaceElement = action.payload[i]
        if (replaceElement != undefined && e.txid == replaceElement.txid) {
          return {
            ...e,
            confirmations: replaceElement.confirmations
          }
        } else {
          return e
        }
      })
      if (state.walletitems.length != action.payload.length) {
        // A new transaction came in before we could update, revert so that there is no issue.
        tempNewItems = state.walletitems
      }
      return {
        ...state,
        walletitems: tempNewItems
      }
      break

    case TYPE.UPDATE_COINVALUE:
      return {
        ...state,
        walletitems: state.walletitems.map((e, i) => {
          let replaceElement = action.payload
          if (replaceElement != undefined && e.time == replaceElement.time) {
            return {
              ...e,
              value: replaceElement.value
            }
          } else {
            return e
          }
        })
      }
      break
    case TYPE.UPDATE_FEEVALUE:
      let tempTransactionsWithfeeValues = state.walletitems.map((e, i) => {
        let replaceElement = action.payload.get(e.time)
        if (replaceElement != undefined) {
          return {
            ...e,
            fee: replaceElement
          }
        } else {
          return e
        }
      })
      return {
        ...state,
        walletitems: tempTransactionsWithfeeValues
      }
      break

    default:
      return state
  }
}
