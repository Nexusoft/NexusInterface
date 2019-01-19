import * as TYPE from 'actions/actiontypes';

const initialState = {
  refundAddress: '',
  ammount: '',
  toAddress: '',
  availableCoins: {},
  from: '',
  to: '',
  availablePair: true,
  withinBounds: false,
  marketPairData: {},
  quote: null,
  greenLight: false,
  transaction: {},
  transactionModalFlag: false,
  email: '',
  acyncButtonFlag: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.AVAILABLE_COINS:
      return {
        ...state,
        availableCoins: action.payload,
        to: Object.values(action.payload)[0].symbol,
        from: Object.values(action.payload)[0].symbol,
      };
      break;
    case TYPE.TOGGLE_ACYNC_BUTTONS:
      return {
        ...state,
        acyncButtonFlag: !state.acyncButtonFlag,
      };
      break;
    case TYPE.FROM_SETTER:
      return {
        ...state,
        from: action.payload,
        ammount: '',
        quote: null,
        greenLight: false,
      };
      break;
    case TYPE.UPDATE_EXCHANGE_AMMOUNT:
      return {
        ...state,
        ammount: action.payload,
      };
      break;
    case TYPE.TO_SETTER:
      return {
        ...state,
        to: action.payload,
        ammount: '',
        quote: null,
        greenLight: false,
      };
      break;
    case TYPE.TOGGLE_WITHIN_TRADE_BOUNDS:
      return {
        ...state,
        withinBounds: !state.withinBounds,
      };
      break;
    case TYPE.SET_REFUND_ADDRESS:
      return {
        ...state,
        refundAddress: action.payload,
      };
      break;
    case TYPE.SET_TO_ADDRESS:
      return {
        ...state,
        toAddress: action.payload,
      };
      break;
    case TYPE.MARKET_PAIR_DATA:
      return {
        ...state,
        marketPairData: action.payload,
        availablePair: true,
      };
      break;
    case TYPE.AVAILABLE_PAIR_FLAG:
      return {
        ...state,
        availablePair: action.payload,
      };
      break;
    case TYPE.SET_QUOTE:
      return {
        ...state,
        quote: action.payload,
      };
      break;
    case TYPE.GREENLIGHT_TRANSACTION:
      return {
        ...state,
        greenLight: action.payload,
      };
      break;
    case TYPE.CLEAR_QUOTE:
      return {
        ...state,
        greenLight: false,
        quote: null,
      };
      break;
    case TYPE.TRANSACTION_MODAL_ACTIVATE:
      return {
        ...state,
        transaction: { ...action.payload },
        transactionModalFlag: true,
        acyncButtonFlag: false,
      };
      break;
    case TYPE.CLEAR_TRANSACTION:
      return {
        ...state,
        transaction: {},
        transactionModalFlag: false,
      };
      break;
    case TYPE.SET_EMAIL:
      return {
        ...state,
        email: action.payload,
      };
      break;

    default:
      return state;
  }
};
