import rpc from 'lib/rpc';
import * as ac from 'actions/setupApp';
import * as TYPE from 'consts/actionTypes';

export const getInfo = () => async dispatch => {
  dispatch(ac.AddRPCCall('getInfo'));
  try {
    const info = await rpc('getinfo', []);
    dispatch({ type: TYPE.GET_INFO, payload: info });
  } catch (err) {
    dispatch(clearCoreInfo());
    console.error(err);
    throw err;
  }
};

export const clearCoreInfo = () => ({
  type: TYPE.CLEAR_CORE_INFO,
});

export const getDifficulty = () => async dispatch => {
  const diff = await rpc('getdifficulty', []);
  dispatch({ type: TYPE.GET_DIFFICULTY, payload: diff });
};
