// Overview
export const GET_INFO = 'GET_INFO';
export const USD_RATE = 'USD_RATE';
export const BTC_RATE = 'BTC_RATE';
export const CHANGE_24 = 'CHANGE_24';
export const SET_SUPPLY = 'SET_SUPPLY';
export const CLEAR_FOR_BOOTSTRAPING = 'CLEAR_FOR_BOOTSTRAPING';
export const CLEAR_CORE_INFO = 'CLEAR_CORE_INFO';
export const SET_PERCENT_DOWNLOADED = 'SET_PERCENT_DOWNLOADED';
export const GET_DIFFICULTY = 'GET_DIFFICULTY';

// Trust
export const GET_TRUST_LIST = 'GET_TRUST_LIST';
export const TOGGLE_SORT_DIRECTION = 'TOGGLE_SORT_DIRECTION';

// Market
export const BITTREX_ORDERBOOK = 'BITTREX_ORDERBOOK';
export const BITTREX_24 = 'BITTREX_24';
export const BINANCE_ORDERBOOK = 'BINANCE_ORDERBOOK';
export const BINANCE_24 = 'BINANCE_24';
export const MARKET_DATA_LOADED = 'MARKET_DATA_LOADED';
export const BINANCE_CANDLESTICK = 'BINANCE_CANDLESTICK';
export const BITTREX_CANDLESTICK = 'BITTREX_CANDLESTICK';
export const REMOVE_ALERT = 'REMOVE_ALERT';
export const SET_ALERTS = 'SET_ALERTS';
export const SET_TRADEVOL = 'SET_TRADEVOL';
export const SET_THRESHOLD = 'SET_THRESHOLD';

// Transaction Page
export const SET_WALL_TRANS = 'SET_WALL_TRANS';
export const SET_TRANSACTION_SENDAGAIN = 'SET_TRANSACTION_SENDAGAIN';
export const SET_TRANSACTION_EXPLOREINFO = 'SET_TRANSACTION_EXPLOREINFO';
export const SET_SELECTED_MYACCOUNT = 'SET_SELECTED_MYACCOUNT';
export const UPDATE_CONFIRMATIONS = 'UPDATE_CONFIRMATIONS';
export const UPDATE_COINVALUE = 'UPDATE_COINVALUE';
export const UPDATE_FEEVALUE = 'UPDATE_FEEVALUE';
export const UPDATE_FILTERED_TRANSACTIONS = 'UPDATE_FILTERED_TRANSACTIONS';

// Login
export const SET_DATE = 'SET_DATE';
export const WIPE_LOGIN_INFO = 'WIPE_LOGIN_INFO';
export const TOGGLE_BUSY_FLAG = 'TOGGLE_BUSY_FLAG';
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';
export const TOGGLE_STAKING_FLAG = 'TOGGLE_STAKING_FLAG';
export const SET_TIME = 'SET_TIME';

// Common
export const LOCK = 'LOCK';
export const UNLOCK = 'UNLOCK';
export const ENCRYPTED = 'ENCRYPTED';
export const UNENCRYPTED = 'UNENCRYPTED';
export const TOGGLE_MODAL_VIS_STATE = 'TOGGLE_MODAL_VIS_STATE';
export const BLOCK_DATE = 'BLOCK_DATE';
export const PORT_AVAILABLE = 'PORT_AVAILABLE';
export const CLEAR_SEARCHBAR = 'CLEAR_SEARCHBAR';
export const ADD_RPC_CALL = 'ADD_RPC_CALL';
export const SET_MKT_AVE_DATA = 'SET_MKT_AVE_DATA';
export const OPEN_BOOTSTRAP_MODAL = 'OPEN_BOOTSTRAP_MODAL';
export const UPDATE_LOCALES = 'UPDATE_LOCALES';
export const SWITCH_MESSAGES = 'SWITCH_MESSAGES';
export const HIDE_ERROR_MODAL = 'HIDE_ERROR_MODAL';
export const SHOW_ERROR_MODAL = 'SHOW_ERROR_MODAL';
export const SHOW_ENCRYPTION_MODAL = 'SHOW_ENCRYPTION_MODAL';

// Send
export const ADD_TO_QUEUE = 'ADD_TO_QUEUE';
export const REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE';
export const UPDATE_ADDRESS = 'UPDATE_ADDRESS';
export const UPDATE_AMOUNT = 'UPDATE_AMOUNT';
export const UPDATE_MESSAGE = 'UPDATE_MESSAGE';
export const UPDATE_ACCOUNT_NAME = 'UPDATE_ACCOUNT_NAME';
export const CLEAR_QUEUE = 'CLEAR_QUEUE';
export const CLEAR_FORM = 'CLEAR_FORM';
export const CHANGE_ACCOUNT = 'CHANGE_ACCOUNT';
export const SELECTED_ACCOUNT = 'SELECTED_ACCOUNT';
export const OPEN_MODAL3 = 'OPEN_MODAL3';
export const OPEN_MODAL4 = 'OPEN_MODAL4';
export const HIDE_MODAL = 'HIDE_MODAL';
export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL2 = 'HIDE_MODAL2';
export const SHOW_MODAL2 = 'SHOW_MODAL2';
export const HIDE_MODAL3 = 'HIDE_MODAL3';
export const SHOW_MODAL3 = 'SHOW_MODAL3';
export const HIDE_MODAL4 = 'HIDE_MODAL4';
export const SHOW_MODAL4 = 'SHOW_MODAL4';
export const CONFIRM = 'CONFIRM';
export const SEARCH = 'SEARCH';
export const SELECT_CONTACT = 'SELECT_CONTACT';
export const OPEN_MOVE_MODAL = 'OPEN_MOVE_MODAL';
export const CLOSE_MOVE_MODAL = 'CLOSE_MOVE_MODAL';
export const MOVE_TO_ACCOUNT = 'MOVE_TO_ACCOUNT';
export const MOVE_FROM_ACCOUNT = 'MOVE_FROM_ACCOUNT';
export const UPDATE_MOVE_AMOUNT = 'UPDATE_MOVE_AMOUNT';

// Exchange
export const AVAILABLE_COINS = 'AVAILABLE_COINS';
export const FROM_SETTER = 'FROM_SETTER';
export const TO_SETTER = 'TO_SETTER';
export const MARKET_PAIR_DATA = 'MARKET_PAIR_DATA';
export const UPDATE_EXCHANGE_AMMOUNT = 'UPDATE_EXCHANGE_AMMOUNT';
export const TOGGLE_WITHIN_TRADE_BOUNDS = 'TOGGLE_WITHIN_TRADE_BOUNDS';
export const SET_REFUND_ADDRESS = 'SET_REFUND_ADDRESS';
export const SET_TO_ADDRESS = 'SET_TO_ADDRESS';
export const AVAILABLE_PAIR_FLAG = 'AVAILABLE_PAIR_FLAG';
export const SET_QUOTE = 'SET_QUOTE';
export const GREENLIGHT_TRANSACTION = 'GREENLIGHT_TRANSACTION';
export const TRANSACTION_MODAL_ACTIVATE = 'TRANSACTION_MODAL_ACTIVATE';
export const CLEAR_TRANSACTION = 'CLEAR_TRANSACTION';
export const SET_EMAIL = 'SET_EMAIL';
export const CLEAR_QUOTE = 'CLEAR_QUOTE';
export const TOGGLE_ACYNC_BUTTONS = 'TOGGLE_ACYNC_BUTTONS';

// AddressBook
export const ADD_NEW_ADDRESS = 'ADD_NEW_ADDRESS';
export const EDIT_ADDRESS = 'EDIT_ADDRESS';
export const EDIT_PHONE = 'EDIT_PHONE';
export const EDIT_NOTES = 'EDIT_NOTES';
export const EDIT_NAME = 'EDIT_NAME';
export const EDIT_ADDRESS_LABEL = 'EDIT_ADDRESS_LABEL';
export const EDIT_TIMEZONE = 'EDIT_TIMEZONE';
export const DELETE_CONTACT = 'DELETE_CONTACT';
export const DELETE_ADDRESS_FROM_CONTACT = 'DELETE_ADDRESS_FROM_CONTACT';
export const LOAD_ADDRESS_BOOK = 'LOAD_ADDRESS_BOOK';
export const ADD_NEW_CONTACT = 'ADD_NEW_CONTACT';
export const UPDATE_CONTACT = 'UPDATE_CONTACT';
export const SET_MODAL_TYPE = 'SET_MODAL_TYPE';
export const CLEAR_PROTOTYPE = 'CLEAR_PROTOTYPE';
export const MY_ACCOUNTS_LIST = 'MY_ACCOUNTS_LIST';
export const SET_SAVE_FLAG_FALSE = 'SET_SAVE_FLAG_FALSE';
export const CONTACT_IMAGE = 'CONTACT_IMAGE';
export const TOGGLE_NOTES_EDIT = 'TOGGLE_NOTES_EDIT';
export const TOGGLE_PHONE_EDIT = 'TOGGLE_PHONE_EDIT';
export const TOGGLE_NAME_EDIT = 'TOGGLE_NAME_EDIT';
export const TOGGLE_ADDRESS_EDIT = 'TOGGLE_ADDRESS_EDIT';
export const TOGGLE_TIMEZONE_EDIT = 'TOGGLE_TIMEZONE_EDIT';
export const TOGGLE_ADDRESS_LABEL_EDIT = 'TOGGLE_ADDRESS_LABEL_EDIT';
export const SAVE_NOTES = 'SAVE_NOTES';
export const SAVE_PHONE = 'SAVE_PHONE';
export const SAVE_NAME = 'SAVE_NAME';
export const SAVE_ADDRESS_LABEL = 'SAVE_ADDRESS_LABEL';
export const SAVE_TIMEZONE = 'SAVE_TIMEZONE';
export const SET_MOUSE_POSITION = 'SET_MOUSE_POSITION';
export const TOGGLE_CREATE_ADDRESS = 'TOGGLE_CREATE_ADDRESS';
export const SET_HIGHEST_PEER_BLOCK = 'SET_HIGHEST_PEER_BLOCK';
export const SET_SYNC_STATUS = 'SET_SYNC_STATUS';
export const IMPORT_CONTACT = 'IMPORT_CONTACT';

// Terminal
export const SET_COMMAND_LIST = 'SET_COMMAND_LIST';
export const SET_CONSOLE_INPUT = 'SET_CONSOLE_INPUT';
export const COMMAND_HISTORY_UP = 'COMMAND_HISTORY_UP';
export const COMMAND_HISTORY_DOWN = 'COMMAND_HISTORY_DOWN';
export const EXECUTE_COMMAND = 'EXECUTE_COMMAND';
export const PRINT_COMMAND_OUTPUT = 'PRINT_COMMAND_OUTPUT';
export const PRINT_COMMAND_ERROR = 'PRINT_COMMAND_ERROR';
export const RESET_CONSOLE_OUTPUT = 'RESET_CONSOLE_OUTPUT';
export const PRINT_CORE_OUTPUT = 'PRINT_CORE_OUTPUT';
export const PAUSE_CORE_OUTPUT = 'PAUSE_CORE_OUTPUT';
export const UNPAUSE_CORE_OUTPUT = 'UNPAUSE_CORE_OUTPUT';

// Settings
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
export const CUSTOMIZE_STYLING = 'CUSTOMIZE_STYLING';
export const RESET_COLORS = 'RESET_COLORS';
export const UPDATE_THEME = 'UPDATE_THEME';

// UI
export const SELECTED_CONTACT = 'SELECTED_CONTACT';
export const CONTACT_SEARCH = 'CONTACT_SEARCH';
export const SWITCH_SETTINGS_TAB = 'SWITCH_SETTINGS_TAB';
export const SWITCH_CONSOLE_TAB = 'SWITCH_CONSOLE_TAB';

// Modules
export const LOAD_MODULES = 'LOAD_MODULES';
export const UPDATE_MODULE_STATE = 'UPDATE_MODULE_STATE';