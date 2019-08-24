import * as TYPE from 'consts/actionTypes';

/**
 * General
 * ===========================
 */

export const closeWallet = () => ({
  type: TYPE.CLOSE_WALLET,
});

/**
 * Transactions
 * ===========================
 */
export const setTxsAccountFilter = account => ({
  type: TYPE.SET_TXS_ACCOUNT_FILTER,
  payload: account,
});

export const setTxsAddressQuery = query => ({
  type: TYPE.SET_TXS_ADDRESS_QUERY,
  payload: query,
});

export const setTxsCategoryFilter = category => ({
  type: TYPE.SET_TXS_CATEGORY_FILTER,
  payload: category,
});

export const setTxsMinAmountFilter = minAmount => ({
  type: TYPE.SET_TXS_MIN_AMOUNT_FILTER,
  payload: minAmount,
});

export const setTxsTimeFilter = timeSpan => ({
  type: TYPE.SET_TXS_TIME_FILTER,
  payload: timeSpan,
});

/**
 * Address Book
 * ===========================
 */
export const searchContact = query => ({
  type: TYPE.CONTACT_SEARCH,
  payload: query,
});

export const selectContact = index => ({
  type: TYPE.SELECT_CONTACT,
  payload: index,
});

/**
 * Settings
 * ===========================
 */
export const switchSettingsTab = tab => ({
  type: TYPE.SWITCH_SETTINGS_TAB,
  payload: tab,
});

/**
 * Console
 * ===========================
 */
export const switchConsoleTab = tab => ({
  type: TYPE.SWITCH_CONSOLE_TAB,
  payload: tab,
});

/**
 * Console/Console
 * ===========================
 */
export const updateConsoleInput = value => ({
  type: TYPE.SET_CONSOLE_INPUT,
  payload: value,
});

export const updateTritiumConsoleInput = value => ({
  type: TYPE.SET_TRITIUM_CONSOLE_INPUT,
  payload: value,
});

export const setCommandList = commandList => ({
  type: TYPE.SET_COMMAND_LIST,
  payload: commandList,
});

export const commandHistoryUp = () => ({
  type: TYPE.COMMAND_HISTORY_UP,
});

export const commandHistoryDown = () => ({
  type: TYPE.COMMAND_HISTORY_DOWN,
});

export const executeCommand = cmd => ({
  type: TYPE.EXECUTE_COMMAND,
  payload: cmd,
});

export const printCommandOutput = text => ({
  type: TYPE.PRINT_COMMAND_OUTPUT,
  payload: text,
});

export const printCommandError = msg => ({
  type: TYPE.PRINT_COMMAND_ERROR,
  payload: msg,
});

export const resetConsoleOutput = () => ({
  type: TYPE.RESET_CONSOLE_OUTPUT,
});

/**
 * Console/Core
 * ===========================
 */
export const printCoreOutput = output => ({
  type: TYPE.PRINT_CORE_OUTPUT,
  payload: output,
});

export const pauseCoreOutput = () => ({
  type: TYPE.PAUSE_CORE_OUTPUT,
});

export const unpauseCoreOutput = () => ({
  type: TYPE.UNPAUSE_CORE_OUTPUT,
});
