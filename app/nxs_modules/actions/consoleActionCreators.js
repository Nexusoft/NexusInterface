import * as TYPE from './actiontypes';

export const loadCommandList = () => async dispatch => {
  const result = await RPC.PROMISE('help', []);
  const commandList = result.split('\n');
  return dispatch({
    type: TYPE.SET_COMMAND_LIST,
    payload: commandList,
  });
};

export const updateCommandInput = value => ({
  type: TYPE.SET_CONSOLE_INPUT,
  payload: value,
});
