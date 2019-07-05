import Request from 'request';
import * as TYPE from './actiontypes';

export const refundAddressSetter = refundAdd => {
  return dispatch => {
    dispatch({ type: TYPE.SET_REFUND_ADDRESS, payload: refundAdd });
  };
};
export const toAddressSetter = toAdd => {
  return dispatch => {
    dispatch({ type: TYPE.SET_TO_ADDRESS, payload: toAdd });
  };
};
export const toggleWithinBounds = () => {
  return dispatch => {
    dispatch({ type: TYPE.TOGGLE_WITHIN_TRADE_BOUNDS });
  };
};

export const setBusyFlag = setting => {
  return dispatch => {
    dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: setting });
  };
};

export const ToggleAcyncButtons = () => {
  return dispatch => {
    dispatch({ type: TYPE.TOGGLE_ACYNC_BUTTONS });
  };
};

export const FromSetter = from => {
  return dispatch => {
    dispatch({ type: TYPE.FROM_SETTER, payload: from });
  };
};

export const ToSetter = to => {
  return dispatch => {
    dispatch({ type: TYPE.TO_SETTER, payload: to });
  };
};

export const ammountUpdater = ammt => {
  return dispatch => {
    dispatch({ type: TYPE.UPDATE_EXCHANGE_AMMOUNT, payload: ammt });
  };
};

export const greenLightTransaction = bool => {
  return dispatch => {
    dispatch({ type: TYPE.GREENLIGHT_TRANSACTION, payload: bool });
  };
};

export const clearQuote = () => {
  return dispatch => {
    dispatch({ type: TYPE.CLEAR_QUOTE });
  };
};

export const GetAvailaleCoins = () => {
  return dispatch => {
    Request(
      {
        url: 'https://shapeshift.io/getcoins',
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          dispatch({
            type: TYPE.AVAILABLE_COINS,
            payload: response.body,
          });
        }
      }
    );
  };
};

export const InitiateFastTransaction = (toAddress, refundAddress, pair) => {
  return dispatch => {
    Request(
      {
        method: 'POST',
        url: 'https://shapeshift.io/shift',
        json: {
          withdrawal: toAddress,
          pair: pair,
          returnAddress: refundAddress,
          apiKey:
            '7740f2c6891ef57fc644ffcf7f6326a6e6e8a19219f05048aa1be83c0273dc3884872086b6e5ac11b9004a7a178af4b979c05745462a29236f2f48445d452825',
        },
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          if (response.body.error) {
            alert(response.body.error);
          } else {
            dispatch({
              type: TYPE.TRANSACTION_MODAL_ACTIVATE,
              payload: {
                depositAddress: response.body.deposit,
                depositType: response.body.depositType,
                orderId: response.body.orderId,
                returnAddress: response.body.returnAddress,
                returnAddressType: response.body.returnAddressType,
                withdrawalAddress: response.body.withdrawal,
                withdrawalType: response.body.withdrawalType,
              },
            });
          }
        }
      }
    );
  };
};

export const GetQuote = (pair, ammount, callback) => {
  return dispatch => {
    Request(
      {
        method: 'POST',
        url: 'https://shapeshift.io/sendamount',
        json: { amount: ammount, pair: pair },
      },
      (error, response, body) => {
        console.log(response);
        if (response.statusCode === 200) {
          if (!response.body.error) {
            dispatch({ type: TYPE.SET_QUOTE, payload: response.body.success });
            dispatch({ type: TYPE.GREENLIGHT_TRANSACTION, payload: true });
            dispatch({ type: TYPE.TOGGLE_ACYNC_BUTTONS });
          } else {
            dispatch({ type: TYPE.TOGGLE_ACYNC_BUTTONS });
            console.log(response.body.error);
          }
        } else if (response.statusCode === 401) {
          console.log(body.message);
        } else if (error) {
          console.log(error);
        }
      }
    );
  };
};

export const InitiateQuotedTransaction = (pair, ammount, toAdd, refundAdd) => {
  return dispatch => {
    Request(
      {
        method: 'POST',
        url: 'https://shapeshift.io/sendamount',
        json: {
          amount: ammount,
          withdrawal: toAdd,
          pair: pair,
          returnAddress: refundAdd,
          apiKey:
            '7740f2c6891ef57fc644ffcf7f6326a6e6e8a19219f05048aa1be83c0273dc3884872086b6e5ac11b9004a7a178af4b979c05745462a29236f2f48445d452825',
        },
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          if (response.body.error) {
            alert(response.body.error);
          } else {
            dispatch({
              type: TYPE.TRANSACTION_MODAL_ACTIVATE,
              payload: {
                depositAddress: response.body.success.deposit,
                depositAmount: response.body.success.depositAmount,
                quotedRate: response.body.success.quotedRate,
                pair: response.body.success.pair,
                expiration: response.body.success.expiration,
                withdrawalAddress: response.body.success.withdrawal,
                withdrawalAmount: response.body.success.withdrawalAmount,
              },
            });
          }
        } else {
          alert(response.statusMessage);
          dispatch({ type: TYPE.TOGGLE_ACYNC_BUTTONS });
        }
      }
    );
  };
};

export const GetPairMarketInfo = pair => {
  return dispatch => {
    Request(
      {
        url: `https://shapeshift.io/marketinfo/${pair}`,
        json: true,
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          if (!response.body.error) {
            dispatch({ type: TYPE.MARKET_PAIR_DATA, payload: response.body });
            dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: false });
          }
        } else if (
          response.body.error ===
          'That pair is temporarily unavailable for trades.'
        ) {
          dispatch({ type: TYPE.AVAILABLE_PAIR_FLAG, payload: false });
          dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: false });
        } else dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: false });
      }
    );
  };
};
